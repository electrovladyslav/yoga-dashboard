import styles from './training-plan.module.css';

export const TrainingStep = ({step}: {step: string}) =>  (
        <article key={step} className={styles.section}>
          <h2>{step}</h2>
        </article>
  )
