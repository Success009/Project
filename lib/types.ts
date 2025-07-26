export enum EventType {
  WATER = 'WATER',
  MEAL = 'MEAL',
  WORKOUT = 'WORKOUT',
}

export interface Exercise {
  name: string;
  sets: number | string;
  reps?: number | string;
  duration?: number; // in seconds
  pacing?: string;
  paceUpSeconds?: number;
  paceDownSeconds?: number;
  repDurationSeconds?: number;
}

export interface ScheduleEvent {
  id: string;
  time: [number, number]; // [hour, minute]
  type: EventType;
  details: string | Exercise[];
  endTime?: [number, number];
}

export interface WorkoutTrackerProps {
  workout: ScheduleEvent;
  currentTime: Date;
  speak?: (text: string) => void;
  vibrate?: (pattern: number | number[]) => void;
}
