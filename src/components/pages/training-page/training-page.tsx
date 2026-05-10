'use client';
import { formatDate } from "@/utils/date.utils";
import { TrainingStep } from '@/components/training-step/training-step';
import { AsanaCard } from '@/components/asana-card/asana-card';
import { Chat } from '@/components/chat/chat';
import styles from './training-page.module.css';
import { type Asana, ASANAS } from '@/constants/asana';
import { STEPS } from '@/constants/steps';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import type { TrainingSteps } from '@/models/training.model';
import { getTraining, saveTraining, migrateFromLocalStorage } from '@/services/training.service';

interface TrainingPageProps {
  trainingDate?: Date;
}

export const TrainingPage = ({trainingDate: propsTrainingDate}: TrainingPageProps) => {
  const [trainingSteps, setTrainingSteps] = useState<TrainingSteps>({});
  const [trainingDate, setTrainingDate] = useState(propsTrainingDate || new Date());
  const [showAIAppliedNotification, setShowAIAppliedNotification] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  useEffect(() => {
    migrateFromLocalStorage();
  }, []);

  const setTrainingFromTheDate = useCallback(async (date: Date) => {
    setIsLoading(true);
    setStorageError(null);
    const result = await getTraining(formatDate(date));
    setIsLoading(false);
    if (!result.ok) {
      setStorageError('Failed to load training data. Please try again.');
      return;
    }
    if (result.value) {
      setTrainingSteps(result.value.steps);
    }
  }, []);

  useEffect(() => {
    if (propsTrainingDate) {
      setTrainingFromTheDate(propsTrainingDate);
    }
  }, [propsTrainingDate, setTrainingFromTheDate]);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveDragId(active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active: draggingAsanaCard, over: overTrainingStep } = event;

    if (overTrainingStep) {
      setTrainingSteps((prevTrainingSteps) => {
        const newTrainingSteps = {...prevTrainingSteps};

        Object.keys(newTrainingSteps).forEach((step) => {
          newTrainingSteps[step] = newTrainingSteps[step].filter((asana) => asana !== draggingAsanaCard.id);
        });

        newTrainingSteps[overTrainingStep.id] = [...(newTrainingSteps[overTrainingStep.id] || []), draggingAsanaCard.id];

        return newTrainingSteps;
      });
    } else {
      const newTrainingSteps = {...trainingSteps};
      Object.keys(newTrainingSteps).forEach((step) => {
        newTrainingSteps[step] = newTrainingSteps[step].filter((asana) => asana !== draggingAsanaCard.id);
      });
      setTrainingSteps(newTrainingSteps);
    }
  }

  function getDraggableChildren(step: string) {
    const currentParentChildrenName = trainingSteps[step];
    if (currentParentChildrenName) {
      return ASANAS.filter((asana) => currentParentChildrenName.includes(asana.english_name)).map((asana) => (
        <AsanaCard {...asana} key={asana.id}/>
      ));
    }
    return null;
  }

  function getAsanaCard(asana: Asana) {
    const isAsanaInStep = Object.values(trainingSteps).some(names => names.includes(asana.english_name));
    return isAsanaInStep ? null :  <AsanaCard {...asana}  key={asana.id} />
  }

  function onDateChange(event: ChangeEvent<HTMLInputElement>) {
    const date = new Date(event.target.value);
    setTrainingFromTheDate(date);
    setTrainingDate(date);
  }

  async function onSaveClick() {
    if (Object.keys(trainingSteps).length) {
      setStorageError(null);
      const result = await saveTraining({date: formatDate(trainingDate), steps: trainingSteps});
      if (!result.ok) {
        setStorageError('Failed to save training. Please try again.');
      }
    }
  }

  function handleAITrainingPlan(aiTrainingSteps: TrainingSteps) {
    setTrainingSteps(aiTrainingSteps);
    setShowAIAppliedNotification(true);
    setTimeout(() => setShowAIAppliedNotification(false), 4000);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <main className={styles.main}>

        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Training</h1>
          <input type="date" value={formatDate(trainingDate)} onChange={onDateChange} className={styles.dateInput}/>
          <button className={styles.saveButton} onClick={onSaveClick} disabled={isLoading}>Save</button>
        </header>

        {storageError && (
          <div role="alert" className={styles.errorBanner}>{storageError}</div>
        )}

        {isLoading ? (
          <div className={styles.loadingIndicator}>Loading…</div>
        ) : (
          <section className={styles.container}>
            {STEPS.map((step) => (
              <TrainingStep step={step} key={step}>
                {getDraggableChildren(step)}
              </TrainingStep>
            ))}
          </section>
        )}

        <section className={styles.library}>
          <h2 className={styles.sectionLabel}>Asana library</h2>
          <div className={styles.asanasContainer}>
            {ASANAS.map(getAsanaCard)}
          </div>
        </section>
      </main>

      {showAIAppliedNotification && (
        <div className={styles.aiNotification}>
          ✨ AI yoga sequence applied successfully! Check your training steps.
        </div>
      )}

      <Chat onTrainingPlanGenerated={handleAITrainingPlan} />

      <DragOverlay>
        {activeDragId ? (
          <AsanaCard {...ASANAS.find(a => a.english_name === activeDragId)!} overlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
