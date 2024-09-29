'use client';
import { formatDate } from "@/utils/date.utils";
import { TrainingStep } from '@/components/training-plan/training-step';
import { AsanaCard } from '@/components/asana-card/asana-card';
import styles from './training-page.module.css';
import { type Asana, ASANAS } from '@/constants/asana';
import { STEPS } from '@/constants/steps';
import { DndContext } from '@dnd-kit/core';
import { type ChangeEvent, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core/dist/types';
import type { TrainingSteps } from '@/models/training.model';
import { saveTraining } from '@/services/trainig.service';

interface TrainingPageProps {
  trainingDate?: Date;
}

export const TrainingPage = ({trainingDate: propsTrainingDate}: TrainingPageProps) => {
  const [parents, setParents] = useState<TrainingSteps>({});
  const [trainingDate, setTrainingDate] = useState(propsTrainingDate || new Date());

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

  function onDateChange(event: ChangeEvent<HTMLInputElement>) {
    setTrainingDate(new Date(event.target.value));
  }

  function onSaveClick() {
    console.log('Save training: ', trainingDate, parents);
    saveTraining({date: trainingDate.toISOString(), steps: parents});
  }

  return (
    <DndContext  onDragEnd={handleDragEnd}>
      <main className={styles.main}>

        <h1>
          <span>Training </span>
          <input type="date" value={formatDate(trainingDate)} onChange={onDateChange} className={styles.dateInput}/>
          <button className={styles.saveButton} onClick={onSaveClick}>Save</button>
        </h1>

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