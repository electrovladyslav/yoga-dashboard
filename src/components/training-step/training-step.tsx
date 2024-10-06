import styles from 'src/components/training-step/training-step.module.css';
import {useDroppable} from '@dnd-kit/core';

interface TrainingStepProps {
  step: string;
  children: React.ReactNode;
}

export const TrainingStep = ({step, children}: TrainingStepProps) =>  {
  const {isOver, setNodeRef} = useDroppable({
    id: `${step}`,
  });
  const style = {
    backgroundColor: isOver ? 'limegreen' : undefined,
  };

  return (
    <article className={styles.step} ref={setNodeRef} style={style}>
      <h2>{step}</h2>
      {children}
    </article>
  )
}
