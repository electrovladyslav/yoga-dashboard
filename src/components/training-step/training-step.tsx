import styles from 'src/components/training-step/training-step.module.css';
import {useDroppable} from '@dnd-kit/core';
import React from 'react';

interface TrainingStepProps {
  step: string;
  children: React.ReactNode;
}

export const TrainingStep = ({step, children}: TrainingStepProps) =>  {
  const {isOver, setNodeRef} = useDroppable({
    id: `${step}`,
  });

  const isEmpty = React.Children.count(children) === 0;
  const className = [
    styles.step,
    isOver ? styles.isOver : '',
  ].filter(Boolean).join(' ');

  return (
    <article className={className} ref={setNodeRef}>
      <h2 className={styles.stepLabel}>{step}</h2>
      <div className={styles.stepBody}>
        {isEmpty ? (
          <p className={styles.placeholder}>Drag asanas here</p>
        ) : children}
      </div>
    </article>
  )
}
