import styles from './training-plan.module.css';
export const TrainingPlan = () => {
  const SECTIONS = ['set-up', 'warm-up', 'workout', 'cool-down', 'stretching', 'shavasanah']

  return (
    <section className={styles.container}>
      {SECTIONS.map((section) => (
        <article key={section} className={styles.section}>
          <h2>{section}</h2>
        </article>
      ))}
    </section>
  )
}