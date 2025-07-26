import { ScheduleEvent, EventType, Exercise } from './types';

// Timing constants for the automated workout tracker
export const REST_BETWEEN_SETS_SECONDS = 45;
export const REST_BETWEEN_EXERCISES_SECONDS = 20;

// Updated workout schedules with detailed timing
const morningWorkout: Exercise[] = [
  { name: 'Pull-ups', sets: 3, reps: 'max', repDurationSeconds: 3 }, // Assuming 'max' reps will be done with an estimated rep time
  { name: 'V-ups', sets: 2, reps: 20, pacing: '2s up, 2s down', paceUpSeconds: 2, paceDownSeconds: 2 },
  { name: 'Planks', sets: 2, duration: 60 },
  { name: 'Stretch', sets: 1, duration: 180 },
];

const middayWorkout: Exercise[] = [
  { name: 'V-ups', sets: 3, reps: 20, pacing: '2s up, 2s down', paceUpSeconds: 2, paceDownSeconds: 2 },
  { name: 'Leg raises', sets: 3, reps: 15, repDurationSeconds: 3 },
  { name: 'Hollow holds', sets: 2, duration: 30 },
  { name: 'Planks', sets: 2, duration: 60 },
];

const eveningWorkout: Exercise[] = [
  { name: 'Pull-ups', sets: '2-3', reps: 'max', repDurationSeconds: 3 },
  { name: 'Hanging leg raises', sets: 3, reps: 12, repDurationSeconds: 3 },
  { name: 'Light squats (optional)', sets: 2, reps: 20, repDurationSeconds: 2 },
  { name: 'Stretch + cooldown', sets: 1, duration: 300 },
];

export const optionalVupExercise: Exercise = {
  name: 'V-ups',
  sets: 1,
  reps: 20,
};

export const OPTIONAL_WORKOUT_TIMES: [number, number][] = [
  [4, 50],
  [10, 35],
  [12, 0],
  [13, 0],
  [14, 0],
  [15, 0],
  [16, 0],
  [19, 30],
];

const scheduleEvents: ScheduleEvent[] = [
  // Water Schedule
  { id: 'w1', time: [3, 30], type: EventType.WATER, details: 'Drink 250 ml (before morning workout)' },
  { id: 'w2', time: [4, 45], type: EventType.WATER, details: 'Drink 250 ml (after morning workout)' },
  { id: 'w3', time: [7, 30], type: EventType.WATER, details: 'Drink 250 ml (at school)' },
  { id: 'w4', time: [9, 30], type: EventType.WATER, details: 'Drink 250 ml (at school)' },
  { id: 'w5', time: [10, 45], type: EventType.WATER, details: 'Drink 250 ml (after school)' },
  { id: 'w6', time: [13, 15], type: EventType.WATER, details: 'Drink 250 ml' },
  { id: 'w7', time: [14, 45], type: EventType.WATER, details: 'Drink 250 ml' },
  { id: 'w8', time: [16, 15], type: EventType.WATER, details: 'Drink 250 ml (before evening workout)' },
  { id: 'w9', time: [18, 30], type: EventType.WATER, details: 'Drink 250 ml (after evening workout)' },
  { id: 'w10', time: [19, 45], type: EventType.WATER, details: 'Drink 250 ml (with dinner)' },
  { id: 'w11', time: [21, 15], type: EventType.WATER, details: 'Drink 125 ml (before bed)' },

  // Meal Schedule
  { id: 'm1', time: [3, 45], type: EventType.MEAL, details: 'Ensure + 240 ml milk + 2 boiled eggs' },
  { id: 'm2', time: [10, 40], type: EventType.MEAL, details: 'Rice + dal + vegetables' },
  { id: 'm3', time: [13, 30], type: EventType.MEAL, details: '1 boiled egg + 120 ml milk' },
  { id: 'm4', time: [16, 45], type: EventType.MEAL, details: '2 sukha roti + honey' },
  { id: 'm5', time: [19, 15], type: EventType.MEAL, details: '3 bread slices + 1 boiled egg' },
  { id: 'm6', time: [20, 45], type: EventType.MEAL, details: 'Rice + dal + vegetables (light meal)' },

  // Workouts Schedule
  { id: 'wo1', time: [4, 0], endTime: [5, 15], type: EventType.WORKOUT, details: morningWorkout },
  { id: 'wo2', time: [10, 45], endTime: [11, 30], type: EventType.WORKOUT, details: middayWorkout },
  { id: 'wo3', time: [17, 30], endTime: [18, 30], type: EventType.WORKOUT, details: eveningWorkout },
];

export const FULL_SCHEDULE: ScheduleEvent[] = scheduleEvents.sort((a, b) => (a.time[0] * 60 + a.time[1]) - (b.time[0] * 60 + b.time[1]));