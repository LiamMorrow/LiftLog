import { SessionBlueprint } from '@/models/blueprint-models';

export enum AppStore {
  Web = 'Web',
  Google = 'Google',
  Apple = 'Apple',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  PreferNotToSay = 'PreferNotToSay',
}

export enum Experience {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Professional = 'Professional',
}

export interface AiWorkoutAttributes {
  gender: Gender;
  weightRange: string;
  age: number;
  daysPerWeek: number;
  goals: string[];
  experience: Experience;
  useImperialUnits: boolean;
  additionalInfo: string;
}

export interface AiWorkoutPlan {
  description: string;
  sessions: SessionBlueprint[];
}

export interface AiSessionAttributes {
  areasToWorkout: string[];
  volume: number;
  // Actually exerciseToWeight
  exerciseToKilograms: { [key: string]: number };
  useImperialUnits: boolean;
  additionalInfo: string;
}
