import styles from './asana-card.module.css';
import type { Asana } from '@/constants/asana.ts';
import {useDraggable} from '@dnd-kit/core';
import Image from 'next/image';

type AsanaCardProps = Asana & { overlay?: boolean };

export const AsanaCard = ({ overlay, ...asana }: AsanaCardProps) => {
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
    id: `${asana.english_name}`,
    disabled: overlay,
  });

  const style = isDragging && !overlay ? { opacity: 0 } : undefined;

  return (
        <article
          className={styles.card}
          ref={overlay ? undefined : setNodeRef}
          style={style}
          {...(overlay ? {} : listeners)}
          {...(overlay ? {} : attributes)}
        >
          <div className={styles.iconCircle}>
            <Image
              src={asana.url_svg}
              alt={asana.sanskrit_name}
              width='50'
              height='50'
            />
          </div>
          <h2 className={styles.title} title={asana.english_name}>{asana.english_name}</h2>
        </article>
  )
}
