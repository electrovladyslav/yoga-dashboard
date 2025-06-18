import { ASANAS } from '@/constants/asana';
import { STEPS } from '@/constants/steps';
import type { TrainingSteps } from '@/models/training.model';

interface YogaRequest {
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  focus: 'strength' | 'flexibility' | 'balance' | 'relaxation' | 'general';
  injuries?: string[];
  preferences?: string[];
}

interface YogaPlan {
  description: string;
  trainingSteps: TrainingSteps;
  tips: string[];
}

class AIYogaService {
  private parseUserMessage(message: string): YogaRequest | null {
    const lowerMessage = message.toLowerCase();
    
    // Extract level
    let level: YogaRequest['level'] = 'beginner';
    if (lowerMessage.includes('intermediate') || lowerMessage.includes('moderate')) {
      level = 'intermediate';
    } else if (lowerMessage.includes('advanced') || lowerMessage.includes('expert')) {
      level = 'advanced';
    }

    // Extract duration
    const durationMatch = lowerMessage.match(/(\d+)\s*(?:min|minute)/i);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 30;

    // Extract focus
    let focus: YogaRequest['focus'] = 'general';
    if (lowerMessage.includes('strength') || lowerMessage.includes('strong')) {
      focus = 'strength';
    } else if (lowerMessage.includes('flexibility') || lowerMessage.includes('stretch')) {
      focus = 'flexibility';
    } else if (lowerMessage.includes('balance')) {
      focus = 'balance';
    } else if (lowerMessage.includes('relax') || lowerMessage.includes('calm') || lowerMessage.includes('stress')) {
      focus = 'relaxation';
    }

    // Check if it's a yoga-related request
    const yogaKeywords = ['yoga', 'asana', 'pose', 'practice', 'sequence', 'training', 'plan'];
    const isYogaRequest = yogaKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (!isYogaRequest) {
      return null;
    }

    return { level, duration, focus };
  }

  private selectAsanasForStep(step: string, request: YogaRequest, count: number): string[] {
    const stepAsanas = this.getAsanasForStep(step, request);
    
    // Shuffle and select random asanas
    const shuffled = [...stepAsanas].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private getAsanasForStep(step: string, request: YogaRequest): string[] {
    const allAsanaNames = ASANAS.map(a => a.english_name);
    
    // Define asana categories based on common yoga sequences
    const stepCategories: Record<string, string[]> = {
      'set-up': [
        'Mountain Pose', 'Easy Pose', 'Standing Forward Bend',
        'Child\'s Pose', 'Cat Cow Pose'
      ],
      'warm-up': [
        'Cat Cow Pose', 'Downward-Facing Dog', 'Low Lunge',
        'Sun Salutation A', 'Standing Forward Bend', 'Upward Salute'
      ],
      'workout': this.getWorkoutAsanas(request),
      'cool-down': [
        'Seated Forward Bend', 'Happy Baby Pose', 'Supine Twist',
        'Bridge Pose', 'Legs-Up-The-Wall Pose'
      ],
      'stretching': [
        'Pigeon Pose', 'Seated Forward Bend', 'Cobra Pose',
        'Butterfly Pose', 'Seated Spinal Twist', 'Extended Triangle Pose'
      ],
      'shavasanah': [
        'Corpse Pose', 'Easy Pose', 'Legs-Up-The-Wall Pose'
      ]
    };

    const stepAsanas = stepCategories[step] || [];
    return stepAsanas.filter(name => allAsanaNames.includes(name));
  }

  private getWorkoutAsanas(request: YogaRequest): string[] {
    const strengthAsanas = [
      'Warrior I', 'Warrior II', 'Warrior III', 'Side Angle Pose',
      'Tree Pose', 'Eagle Pose', 'Chair Pose', 'Plank Pose',
      'Chaturanga Dandasana', 'Crow Pose'
    ];

    const flexibilityAsanas = [
      'Extended Triangle Pose', 'Extended Side Angle Pose',
      'Pigeon Pose', 'Camel Pose', 'Wheel Pose', 'King Pigeon Pose',
      'Compass Pose', 'Bird of Paradise'
    ];

    const balanceAsanas = [
      'Tree Pose', 'Eagle Pose', 'Warrior III', 'Dancer Pose',
      'Standing Hand-To-Big-Toe Pose', 'Crow Pose', 'Side Crow'
    ];

    const relaxationAsanas = [
      'Child\'s Pose', 'Supported Fish Pose', 'Legs-Up-The-Wall Pose',
      'Reclined Butterfly Pose', 'Happy Baby Pose'
    ];

    switch (request.focus) {
      case 'strength':
        return strengthAsanas;
      case 'flexibility':
        return flexibilityAsanas;
      case 'balance':
        return balanceAsanas;
      case 'relaxation':
        return relaxationAsanas;
      default:
        return [...strengthAsanas, ...flexibilityAsanas, ...balanceAsanas].slice(0, 15);
    }
  }

  private generateTrainingSteps(request: YogaRequest): TrainingSteps {
    const steps: TrainingSteps = {};
    
    // Determine asana counts based on duration and level
    const totalAsanas = Math.max(8, Math.floor(request.duration / 3));
    const distribution = {
      'set-up': Math.max(1, Math.floor(totalAsanas * 0.1)),
      'warm-up': Math.max(2, Math.floor(totalAsanas * 0.2)),
      'workout': Math.max(3, Math.floor(totalAsanas * 0.4)),
      'cool-down': Math.max(2, Math.floor(totalAsanas * 0.15)),
      'stretching': Math.max(2, Math.floor(totalAsanas * 0.1)),
      'shavasanah': 1
    };

    STEPS.forEach(step => {
      const count = distribution[step as keyof typeof distribution] || 1;
      steps[step] = this.selectAsanasForStep(step, request, count);
    });

    return steps;
  }

  private generateDescription(request: YogaRequest): string {
    const levelText = request.level === 'beginner' ? 'gentle, beginner-friendly' :
                     request.level === 'intermediate' ? 'moderately challenging' :
                     'advanced and challenging';
    
    const focusText = request.focus === 'strength' ? 'building strength and stability' :
                      request.focus === 'flexibility' ? 'improving flexibility and mobility' :
                      request.focus === 'balance' ? 'enhancing balance and coordination' :
                      request.focus === 'relaxation' ? 'promoting relaxation and stress relief' :
                      'providing a well-rounded practice';

    return `I've created a ${levelText} ${request.duration}-minute yoga sequence focused on ${focusText}. This practice includes a proper warm-up, targeted poses for your goals, and a relaxing cool-down.`;
  }

  private generateTips(request: YogaRequest): string[] {
    const baseTips = [
      'Listen to your body and modify poses as needed',
      'Breathe deeply and maintain steady breathing throughout',
      'Hold each pose for 30-60 seconds unless otherwise specified'
    ];

    const levelTips = {
      beginner: [
        'Don\'t worry about perfect alignment - focus on how the pose feels',
        'Use props like blocks or straps if available',
        'Take breaks in Child\'s Pose whenever needed'
      ],
      intermediate: [
        'Focus on proper alignment and engaging your core',
        'Try to flow smoothly between poses',
        'Challenge yourself while respecting your limits'
      ],
      advanced: [
        'Maintain bandhas (energy locks) throughout the practice',
        'Work on advanced variations if they feel accessible',
        'Focus on the energetic aspects of each pose'
      ]
    };

    const focusTips = {
      strength: ['Engage your core in all poses', 'Hold challenging poses a bit longer'],
      flexibility: ['Warm up thoroughly before deep stretches', 'Never force a stretch'],
      balance: ['Fix your gaze on a steady point', 'Start with easier variations'],
      relaxation: ['Let go of any tension with each exhale', 'Focus on the present moment'],
      general: ['Maintain a steady, even breath throughout']
    };

    return [
      ...baseTips,
      ...levelTips[request.level],
      ...focusTips[request.focus]
    ].slice(0, 5);
  }

  public async generateResponse(userMessage: string): Promise<string> {
    const request = this.parseUserMessage(userMessage);
    
    if (!request) {
      return "I'd love to help you with yoga! Please tell me about what kind of practice you're looking for. For example: 'I want a 30-minute beginner yoga sequence for flexibility' or 'Create an advanced strength-focused practice'.";
    }

    const plan = this.generateYogaPlan(request);
    
    return `${plan.description}\n\n**Practice Tips:**\n${plan.tips.map(tip => `• ${tip}`).join('\n')}\n\nI've suggested asanas for each phase of your practice. You can drag them from the available poses below into your training steps!`;
  }

  public generateYogaPlan(request: YogaRequest): YogaPlan {
    return {
      description: this.generateDescription(request),
      trainingSteps: this.generateTrainingSteps(request),
      tips: this.generateTips(request)
    };
  }
}

export const aiYogaService = new AIYogaService();