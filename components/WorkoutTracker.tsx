import React, { useMemo, useEffect, useRef } from 'react';
import { ScheduleEvent, Exercise, WorkoutTrackerProps } from '../lib/types';
import { REST_BETWEEN_SETS_SECONDS, REST_BETWEEN_EXERCISES_SECONDS } from '../lib/scheduleData';

// A single step in the detailed workout plan (e.g., one rep, one rest period)
interface WorkoutTimelineStep {
  startTime: number; // seconds from workout start
  endTime: number;
  type: 'EXERCISE_ACTIVE' | 'SET_REST' | 'EXERCISE_REST' | 'COMPLETED';
  exercise: Exercise;
  currentSet: number;
  totalSets: number;
  // For active exercise
  repNumber?: number;
  pacingPhase?: 'UP' | 'DOWN';
}

const parseSets = (sets: number | string): number => {
    if (typeof sets === 'number') return sets;
    const lastNum = sets.split('-').pop();
    return parseInt(lastNum || '1', 10);
};

const buildWorkoutTimeline = (exercises: Exercise[]): WorkoutTimelineStep[] => {
    const timeline: WorkoutTimelineStep[] = [];
    let cumulativeTime = 0;

    exercises.forEach((exercise, exerciseIndex) => {
        const totalSets = parseSets(exercise.sets);

        for (let setIndex = 1; setIndex <= totalSets; setIndex++) {
            // Active Set Period
            const activeSetStartTime = cumulativeTime;
            let activeSetDuration = 0;
            if (exercise.duration) { // Timed exercise like Plank
                activeSetDuration = exercise.duration;
            } else if (typeof exercise.reps === 'number') { // Rep-based exercise
                const repTime = exercise.paceUpSeconds && exercise.paceDownSeconds 
                    ? exercise.paceUpSeconds + exercise.paceDownSeconds 
                    : exercise.repDurationSeconds || 2;
                activeSetDuration = exercise.reps * repTime;
            }
            
            timeline.push({
                startTime: activeSetStartTime,
                endTime: activeSetStartTime + activeSetDuration,
                type: 'EXERCISE_ACTIVE',
                exercise,
                currentSet: setIndex,
                totalSets,
            });
            cumulativeTime += activeSetDuration;

            // Rest Period after the set (but not after the last set of the last exercise)
            if (setIndex < totalSets) {
                timeline.push({
                    startTime: cumulativeTime,
                    endTime: cumulativeTime + REST_BETWEEN_SETS_SECONDS,
                    type: 'SET_REST',
                    exercise,
                    currentSet: setIndex,
                    totalSets,
                });
                cumulativeTime += REST_BETWEEN_SETS_SECONDS;
            }
        }

        // Rest between different exercises
        if (exerciseIndex < exercises.length - 1) {
            timeline.push({
                startTime: cumulativeTime,
                endTime: cumulativeTime + REST_BETWEEN_EXERCISES_SECONDS,
                type: 'EXERCISE_REST',
                exercise, // The exercise just finished
                currentSet: totalSets,
                totalSets,
            });
            cumulativeTime += REST_BETWEEN_EXERCISES_SECONDS;
        }
    });

    return timeline;
};


const PacingIndicator: React.FC<{ phase?: 'UP' | 'DOWN', text: string }> = ({ phase, text }) => (
    <div className="text-center">
        <div className={`text-6xl md:text-8xl font-black transition-all duration-300 ${phase ? 'text-rose-400 scale-110' : 'text-white'}`}>{text}</div>
        <div className="text-lg text-slate-400 -mt-2">{phase ? `(${phase})` : ''}</div>
    </div>
);


export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ workout, currentTime, speak, vibrate }) => {
    const exercises = Array.isArray(workout.details) ? workout.details : [];
    const workoutTimeline = useMemo(() => buildWorkoutTimeline(exercises), [workout.id]);

    const workoutStartDate = new Date(currentTime);
    workoutStartDate.setHours(workout.time[0], workout.time[1], 0, 0);

    const elapsedSeconds = (currentTime.getTime() - workoutStartDate.getTime()) / 1000;
    
    const currentStep = workoutTimeline.find(step => elapsedSeconds >= step.startTime && elapsedSeconds < step.endTime);

    const prevStepId = useRef<string | null>(null);
    const stepId = currentStep ? `${currentStep.exercise.name}-${currentStep.currentSet}-${currentStep.type}` : 'completed';

    useEffect(() => {
        if (stepId !== prevStepId.current) {
            if (currentStep && speak && vibrate) {
                 switch (currentStep.type) {
                    case 'EXERCISE_ACTIVE':
                        const { exercise, currentSet, totalSets } = currentStep;
                        let details = '';
                        if (exercise.reps) details = `${exercise.reps} reps`;
                        if (exercise.duration) details = `${exercise.duration} seconds`;
                        speak(`Start ${exercise.name}. Set ${currentSet} of ${totalSets}. ${details}`);
                        vibrate([300, 150, 300]);
                        break;
                    case 'SET_REST':
                    case 'EXERCISE_REST':
                        const duration = currentStep.endTime - currentStep.startTime;
                        speak(`Rest for ${Math.round(duration)} seconds.`);
                        vibrate(400);
                        break;
                }
            } else if (prevStepId.current && prevStepId.current !== 'completed' && speak && vibrate) {
                // This means we just transitioned to completed state
                speak('Workout complete. Great job!');
                vibrate([100, 50, 100, 50, 100]);
            }
            prevStepId.current = stepId;
        }
    }, [stepId, currentStep, speak, vibrate]);


    if (!currentStep) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800 rounded-2xl shadow-2xl h-full">
                <h2 className="text-3xl font-black text-emerald-400">Workout Complete!</h2>
                <p className="text-slate-300 mt-2">Great job. Time to rest and recover.</p>
            </div>
        );
    }
    
    const { exercise, type, currentSet, totalSets, startTime, endTime } = currentStep;
    const secondsIntoStep = elapsedSeconds - startTime;

    let display;

    switch (type) {
        case 'EXERCISE_ACTIVE':
            let content;
            if (exercise.duration) { // Timed exercise
                const remaining = Math.ceil(exercise.duration - secondsIntoStep);
                content = <PacingIndicator text={`${remaining}s`} />;
            } else if (typeof exercise.reps === 'number') { // Rep-based exercise
                const repTime = (exercise.paceUpSeconds || 0) + (exercise.paceDownSeconds || 0) || exercise.repDurationSeconds || 2;
                const currentRep = Math.floor(secondsIntoStep / repTime) + 1;
                
                const timeIntoRep = secondsIntoStep % repTime;
                let phase: 'UP' | 'DOWN' | undefined = undefined;
                if(exercise.paceUpSeconds && timeIntoRep < exercise.paceUpSeconds) {
                    phase = 'UP';
                } else if (exercise.paceDownSeconds) {
                    phase = 'DOWN';
                }
                content = <PacingIndicator phase={phase} text={`Rep ${currentRep}`} />;
            } else { // 'max reps'
                content = <PacingIndicator text="Max Reps" />;
            }

            display = (
                <div className="flex-grow flex flex-col items-center justify-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white my-2">{exercise.name}</h2>
                    {exercise.pacing && <p className="text-slate-400 italic mb-4">{exercise.pacing}</p>}
                    <div className="my-6">{content}</div>
                    <p className="text-2xl font-bold text-slate-200">Set {currentSet} of {totalSets}</p>
                </div>
            );
            break;
        
        case 'SET_REST':
        case 'EXERCISE_REST':
            const remainingRest = Math.ceil(endTime - elapsedSeconds);
            const nextExercise = type === 'EXERCISE_REST' ? exercises[exercises.indexOf(exercise) + 1] : exercise;
            display = (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <div className="text-8xl md:text-9xl font-black text-emerald-400 tabular-nums">{remainingRest}s</div>
                    <h2 className="text-3xl font-bold text-slate-200 mt-2">REST</h2>
                    <p className="text-slate-400 mt-4 text-lg">Next up: {nextExercise.name} (Set {type === 'EXERCISE_REST' ? 1 : currentSet + 1})</p>
                </div>
            );
            break;

        default:
            display = <div>Loading...</div>;
    }

    const totalWorkoutDuration = workoutTimeline[workoutTimeline.length - 1]?.endTime || 1;
    const progressPercentage = (elapsedSeconds / totalWorkoutDuration) * 100;

    return (
        <div className="flex flex-col p-4 md:p-6 bg-slate-800 rounded-2xl shadow-2xl text-center h-[36rem] md:h-[32rem]">
            <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                <div className="bg-rose-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progressPercentage)}%` }}></div>
            </div>
            {display}
        </div>
    );
};