import styles from './asana-card.module.css';
import type { Asana } from '@/constants/asana.ts';
import {useDraggable} from '@dnd-kit/core';
import Image from 'next/image';

export const AsanaCard = (asana: Asana) => {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: `${asana.english_name}`,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
        <article className={styles.card} ref={setNodeRef} style={style} {...listeners} {...attributes}>
          <Image
            src={asana.url_svg}
            alt={asana.sanskrit_name}
            width='50'
            height='50'
          />
          <h2 className={`${styles.title} line-clamp-2`}>{asana.english_name}</h2>
          {/*<p className={`${styles.subtitle} line-clamp-1`}>{asana.sanskrit_name}</p>*/}
        </article>
  )
}