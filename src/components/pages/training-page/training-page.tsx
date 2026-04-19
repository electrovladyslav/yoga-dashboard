'use client';
import { formatDate } from "@/utils/date.utils";
import { TrainingStep } from '@/components/training-step/training-step';
import { AsanaCard } from '@/components/asana-card/asana-card';
import { Chat } from '@/components/chat/chat';
import styles from './training-page.module.css';
import { type Asana, ASANAS } from '@/constants/asana';
import { STEPS } from '@/constants/steps';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import type { TrainingSteps } from '@/models/training.model';
import { getTrainings, saveTraining } from '@/services/training.service';

interface TrainingPageProps {
  trainingDate?: Date;
}

export const TrainingPage = ({trainingDate: propsTrainingDate}: TrainingPageProps) => {
  const [trainingSteps, setTrainingSteps] = useState<TrainingSteps>({});
  const [trainingDate, setTrainingDate] = useState(propsTrainingDate || new Date());
  const [showAIAppliedNotification, setShowAIAppliedNotification] = useState(false);

  const setTrainingFromTheDate = useCallback((date: Date) => {
    const storedTrainings = getTrainings(formatDate(date));
    if (storedTrainings) {
      setTrainingSteps(storedTrainings.steps);
    }
  }, []);

  useEffect(() => {
    if (propsTrainingDate) {
      setTrainingFromTheDate(propsTrainingDate);
    }
  }, [propsTrainingDate, setTrainingFromTheDate]);

  function handleDragEnd(event: DragEndEvent) {
    const { active: draggingAsanaCard, over: overTrainingStep } = event;

    if (overTrainingStep) {
      setTrainingSteps((prevTrainingSteps) => {
        const newTrainingSteps = {...prevTrainingSteps};
        
        // Remove asana from all previous steps
        Object.keys(newTrainingSteps).forEach((step) => {
          newTrainingSteps[step] = newTrainingSteps[step].filter((asana) => asana !== draggingAsanaCard.id);
        });
        
        // Add asana to the target step
        newTrainingSteps[overTrainingStep.id] = [...(newTrainingSteps[overTrainingStep.id] || []), draggingAsanaCard.id];
        
        return newTrainingSteps;
      });
    } else {
      // remove from prev holding steps
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

  function onSaveClick() {
    if (Object.keys(trainingSteps).length) {
      saveTraining({date: formatDate(trainingDate), steps: trainingSteps});
    }
  }

  function handleAITrainingPlan(aiTrainingSteps: TrainingSteps) {
    setTrainingSteps(aiTrainingSteps);
    setShowAIAppliedNotification(true);
    // Hide notification after 4 seconds
    setTimeout(() => setShowAIAppliedNotification(false), 4000);
  }

  return (
    <DndContext  onDragEnd={handleDragEnd}>
      <main className={styles.main}>

        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Training</h1>
          <input type="date" value={formatDate(trainingDate)} onChange={onDateChange} className={styles.dateInput}/>
          <button className={styles.saveButton} onClick={onSaveClick}>Save</button>
        </header>

        <section className={styles.container}>
          {STEPS.map((step) => (
            <TrainingStep step={step}  key={step}>
              {getDraggableChildren(step)}
            </TrainingStep>
          ))}
        </section>


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
    </DndContext>
  )
}