import type { UniqueIdentifier } from '@dnd-kit/core';

export interface TrainingSteps {
  // Steps: Asana[];
  [key: string]: UniqueIdentifier;
}

export interface Training {
  date: string;
  steps: TrainingSteps;
}
