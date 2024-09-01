import { formatDate } from "@/utils/date.utils.ts";
import { TrainingPlan } from '@/components/training-plan/training-plan.tsx';
import { AsanaCards } from '@/components/asana-cards/asana-cards.tsx';
import styles from './training-page.module.css';
interface TrainingPageProps {
  trainingDate: Date;
}

export const TrainingPage = ({trainingDate}: TrainingPageProps) => {

  return (
    <main className={styles.main}>
      <h1>Training {formatDate(trainingDate)}</h1>
      <TrainingPlan />
      <AsanaCards />
    </main>
  )
}