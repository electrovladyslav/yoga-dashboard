import { formatDate } from "@/utils/date.utils.ts";
import { TrainingStep } from '@/components/training-plan/training-step.tsx';
import { AsanaCard } from '@/components/asana-card/asana-card.tsx';
import styles from './training-page.module.css';
import { type Asana, ASANAS } from '@/constants/asana.ts';
import { STEPS } from '@/constants/steps.ts';
import { DndContext, type UniqueIdentifier } from '@dnd-kit/core';
import { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core/dist/types';

interface TrainingPageProps {
  trainingDate: Date;
}

export const TrainingPage = ({trainingDate}: TrainingPageProps) => {
  const [parents, setParents] = useState<Record<string, UniqueIdentifier>>({});

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over) {
      setParents((prev) => ({
        ...prev,
        [over.id]: active.id,
      }));
    }
  }

  function getDraggableChildren(step: string) {
    const currentParentChildrenName = parents[step];
    if (currentParentChildrenName) {
      return ASANAS.filter((asana) => currentParentChildrenName === asana.english_name).map((asana) => (
        <AsanaCard {...asana} key={asana.id}/>
      ));
    }
    return null;
  }

  function getAsanaCard(asana: Asana) {
    const isAsanaInStep = Object.values(parents).includes(asana.english_name);
    return isAsanaInStep ? null :  <AsanaCard {...asana}  key={asana.id} />
  }

  return (
    <DndContext  onDragEnd={handleDragEnd}>
      <main className={styles.main}>
        <h1>Training {formatDate(trainingDate)}</h1>

        <section className={styles.container}>
          {STEPS.map((step) => (
            <TrainingStep step={step}  key={step}>
              {getDraggableChildren(step)}
            </TrainingStep>
          ))}
        </section>


        <section className={`${styles.asanasContainer} ${styles.container}`}>
          {ASANAS.map(getAsanaCard)}
        </section>
      </main>
    </DndContext>
  )
}