import styles from './asana-card.module.css';
import type { Asana } from '@/constants/asana.ts';

export const AsanaCard = (asana: Asana) => {
  return (
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
  )
}