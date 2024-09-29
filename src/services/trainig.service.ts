import type { Training } from '@/models/training.model';

export const saveTraining = (training: Training): void  => {
  localSaveTraining(training);
}

export const getTrainings = (): Training[] => {
  return localGetTrainings()
}

const localSaveTraining = (training: Training): void => {
  const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
  trainings.push(training);
  localStorage.setItem('trainings', JSON.stringify(trainings));
}

const localGetTrainings = (): Training[] => {
  return JSON.parse(localStorage.getItem('trainings') || '[]');
}