import { type Asana, ASANAS } from '@/constants/asana.ts'
import styles from './asana-cards.module.css';

export const AsanaCards = () => {
  return (
    <section className={styles.container}>
      {ASANAS.slice(0, 9).map((asana: Asana) => (
        <article key={asana.id} className={styles.card}>
          <img
            src={asana.url_svg}
            alt={asana.sanskrit_name}
            width='80'
            height='80'
          />
          <h2 className={styles.title}>{asana.english_name}</h2>
          <p className={styles.subtitle}>{asana.sanskrit_name}</p>
        </article>
      ))}
    </section>
  )
}