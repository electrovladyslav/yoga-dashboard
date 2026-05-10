import { describe, it, expect } from 'vitest';
import { aiYogaService } from './ai-yoga.service';
import { STEPS } from '@/constants/steps';

describe('aiYogaService.generateResponse', () => {
  it('returns hasTrainingPlan: false for a non-yoga message', async () => {
    const result = await aiYogaService.generateResponse('what is the weather today?');
    expect(result.hasTrainingPlan).toBe(false);
    expect(result.trainingPlan).toBeUndefined();
  });

  it('returns hasTrainingPlan: true for a yoga request', async () => {
    const result = await aiYogaService.generateResponse('I want a 30 minute beginner yoga sequence');
    expect(result.hasTrainingPlan).toBe(true);
    expect(result.trainingPlan).toBeDefined();
  });

  it('generates training steps for all 6 phases', async () => {
    const result = await aiYogaService.generateResponse('create a 45 min yoga plan');
    expect(result.trainingPlan?.trainingSteps).toBeDefined();
    const keys = Object.keys(result.trainingPlan!.trainingSteps);
    STEPS.forEach(step => expect(keys).toContain(step));
  });

  it('includes tips in the generated plan', async () => {
    const result = await aiYogaService.generateResponse('30 minute yoga training');
    expect(result.trainingPlan?.tips.length).toBeGreaterThan(0);
  });

  it('includes a description in the generated plan', async () => {
    const result = await aiYogaService.generateResponse('intermediate yoga for strength 60 min');
    expect(result.trainingPlan?.description).toContain('strength');
  });

  it('parses duration from the message', async () => {
    const result = await aiYogaService.generateResponse('give me a 60 minute yoga practice');
    expect(result.trainingPlan?.description).toContain('60');
  });

  it('detects advanced level from the message', async () => {
    const result = await aiYogaService.generateResponse('advanced yoga sequence for experts');
    expect(result.trainingPlan?.description).toContain('advanced');
  });

  it('detects relaxation focus from the message', async () => {
    const result = await aiYogaService.generateResponse('yoga to relax and relieve stress');
    expect(result.trainingPlan?.description).toContain('relaxation');
  });
});
