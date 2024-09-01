import { formatDate } from "@/utils/date.utils.ts";
import { TrainingPlan } from '@/components/training-plan/training-plan.tsx';

interface TrainingPageProps {
  trainingDate: Date;
}

export const TrainingPage = ({trainingDate}: TrainingPageProps) => {

  return (
    <>
      <h1>Training {formatDate(trainingDate)}</h1>
      <TrainingPlan />
    </>
  )
}