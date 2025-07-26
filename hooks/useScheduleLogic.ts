import { useMemo } from 'react';
import { ScheduleEvent, EventType } from '../lib/types';
import { FULL_SCHEDULE, OPTIONAL_WORKOUT_TIMES } from '../lib/scheduleData';

export const timeToMinutes = (time: [number, number]) => time[0] * 60 + time[1];

export type OptionalVupStatus = {
    state: 'INACTIVE' | 'COUNTDOWN' | 'PROMPT';
    countdownMinutes?: number;
};

export const useScheduleLogic = (currentTime: Date) => {

  const eventsForTimeline = useMemo(() => {
    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEvents = FULL_SCHEDULE.map(event => ({ ...event, date: today }));
    const tomorrowEvents = FULL_SCHEDULE.map(event => ({ ...event, date: tomorrow }));

    return [...todayEvents, ...tomorrowEvents];
  }, [currentTime]);

  const nowInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const nextWater = useMemo(() => eventsForTimeline.find(e => e.type === EventType.WATER && (timeToMinutes(e.time) > nowInMinutes || e.date > currentTime)), [eventsForTimeline, nowInMinutes, currentTime]);
  const nextMeal = useMemo(() => eventsForTimeline.find(e => e.type === EventType.MEAL && (timeToMinutes(e.time) > nowInMinutes || e.date > currentTime)), [eventsForTimeline, nowInMinutes, currentTime]);
  const nextWorkout = useMemo(() => eventsForTimeline.find(e => e.type === EventType.WORKOUT && (timeToMinutes(e.time) > nowInMinutes || e.date > currentTime)), [eventsForTimeline, nowInMinutes, currentTime]);

  const allUpcomingEvents = useMemo(() => {
    return eventsForTimeline
      .filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(e.time[0], e.time[1], 0, 0);
        return eventDate > currentTime;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        dateA.setHours(a.time[0], a.time[1]);
        const dateB = new Date(b.date);
        dateB.setHours(b.time[0], b.time[1]);
        return dateA.getTime() - dateB.getTime();
      });
  }, [eventsForTimeline, currentTime]);

  const nextEvent = allUpcomingEvents[0];

  const activeWorkout = useMemo(() => {
    return FULL_SCHEDULE.find(event => {
      if (event.type !== EventType.WORKOUT || !event.endTime) return false;
      const startMinutes = timeToMinutes(event.time);
      const endMinutes = timeToMinutes(event.endTime);
      return nowInMinutes >= startMinutes && nowInMinutes < endMinutes;
    });
  }, [nowInMinutes]);

  const getMinutesUntil = (event: (ScheduleEvent & { date: Date })) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(event.time[0], event.time[1], 0, 0);
      return (eventDate.getTime() - currentTime.getTime()) / (1000 * 60);
  }

  const status = useMemo(() => {
    const currentSecond = currentTime.getSeconds();
    
    if (activeWorkout) {
      return { type: 'WORKOUT_ACTIVE', message: `🏋️ Workout in progress...` };
    }
    
    // Time-pure check for instant notifications
    const activeInstantEvent = FULL_SCHEDULE.find(event => 
        (event.type === EventType.WATER || event.type === EventType.MEAL) && 
        timeToMinutes(event.time) === nowInMinutes
    );

    if (activeInstantEvent && currentSecond < 5) {
        const message = activeInstantEvent.type === EventType.WATER ? '💧 Drink water now' : '🍽️ Time to eat';
        const type = activeInstantEvent.type === EventType.WATER ? 'ACTION_NOW_WATER' : 'ACTION_NOW_MEAL';
        return { type, message };
    }
    
    // Check for 2-minute warnings
    if (nextWorkout) {
      const diffMinutes = getMinutesUntil(nextWorkout);
      if (diffMinutes <= 2 && diffMinutes > 0) {
        return { type: 'WORKOUT_PREP', message: `💪 Workout in ${Math.ceil(diffMinutes)} min. Get ready!` };
      }
    }
    if (nextMeal) {
        const diffMinutes = getMinutesUntil(nextMeal);
        if (diffMinutes <= 2 && diffMinutes > 0) {
            return { type: 'MEAL_PREP', message: `🍽️ Meal in ${Math.ceil(diffMinutes)} min. Get ready!` };
        }
    }
    if (nextWater) {
        const diffMinutes = getMinutesUntil(nextWater);
        if (diffMinutes <= 2 && diffMinutes > 0) {
            return { type: 'WATER_PREP', message: `💧 Water in ${Math.ceil(diffMinutes)} min. Get ready!` };
        }
    }

    if (nextEvent) {
        const nextEventDate = new Date(nextEvent.date);
        nextEventDate.setHours(nextEvent.time[0], nextEvent.time[1], 0, 0);
        const diffMs = nextEventDate.getTime() - currentTime.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return { type: 'RESTING', message: `✅ You’re on rest. Next up in ${hours}h ${minutes}m.` };
    }

    return { type: 'RESTING', message: '✅ All tasks done for the day!' };
  }, [activeWorkout, currentTime, nextWorkout, nextMeal, nextWater, nextEvent]);

  const optionalVupStatus: OptionalVupStatus = useMemo(() => {
    const nowInSecondsFromMidnight = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();

    // Check if we are inside a 40-second prompt window
    const activeChallengeTime = OPTIONAL_WORKOUT_TIMES.find(time => {
        const startSeconds = time[0] * 3600 + time[1] * 60;
        return nowInSecondsFromMidnight >= startSeconds && nowInSecondsFromMidnight < (startSeconds + 40);
    });

    if (activeChallengeTime) {
        return { state: 'PROMPT' };
    }

    // Otherwise, find the next upcoming challenge and show a countdown
    const nowInMinutes = timeToMinutes([currentTime.getHours(), currentTime.getMinutes()]);
    const nextChallenge = OPTIONAL_WORKOUT_TIMES.find(time => timeToMinutes(time) > nowInMinutes);
    
    let nextChallengeStartMinutes: number;
    if (nextChallenge) {
        nextChallengeStartMinutes = timeToMinutes(nextChallenge);
    } else {
        // All challenges for today are done, countdown to the first one tomorrow
        nextChallengeStartMinutes = timeToMinutes(OPTIONAL_WORKOUT_TIMES[0]) + (24 * 60);
    }
    
    const countdownMinutes = nextChallengeStartMinutes - nowInMinutes;
    return { state: 'COUNTDOWN', countdownMinutes };
  }, [currentTime]);


  return {
    status,
    activeWorkout,
    nextTasks: {
      water: nextWater,
      meal: nextMeal,
      workout: nextWorkout,
    },
    allDayEvents: FULL_SCHEDULE,
    optionalVupStatus,
  };
};