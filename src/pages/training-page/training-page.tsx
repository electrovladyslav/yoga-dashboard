import { formatDate } from "@/utils/date.utils.ts";
import { TrainingStep } from '@/components/training-plan/training-step.tsx';
import { AsanaCard } from '@/components/asana-card/asana-card.tsx';
import styles from './training-page.module.css';
import { type Asana, ASANAS } from '@/constants/asana.ts';
import { STEPS } from '@/constants/steps.ts';
interface TrainingPageProps {
  trainingDate: Date;
}

export const TrainingPage = ({trainingDate}: TrainingPageProps) => {

  return (
    <main className={styles.main}>
      <h1>Training {formatDate(trainingDate)}</h1>

      <section className={styles.container}>
        {STEPS.map((step) => (
          <TrainingStep step={step} />
        ))}
      </section>

      <section className={`${styles.asanasContainer} ${styles.container}`}>
        {ASANAS.map((asana: Asana) => (
           <AsanaCard {...asana} />
        ))}
      </section>
    </main>
  )
}