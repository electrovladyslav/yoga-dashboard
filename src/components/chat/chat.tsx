'use client';
import { useState, useRef, useEffect } from 'react';
import { aiYogaService } from '@/services/ai-yoga.service';
import type { TrainingSteps } from '@/models/training.model';
import styles from './chat.module.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  hasTrainingPlan?: boolean;
  trainingSteps?: TrainingSteps;
}

interface ChatProps {
  onTrainingPlanGenerated?: (trainingSteps: TrainingSteps) => void;
}

export const Chat = ({ onTrainingPlanGenerated }: ChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I can help you create personalized yoga training plans. Tell me about your experience level, goals, and any preferences you have!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const response = await aiYogaService.generateResponse(userMessage);
      return {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        hasTrainingPlan: response.hasTrainingPlan,
        trainingSteps: response.trainingPlan?.trainingSteps
      };
    } catch (error) {
      console.error('AI service error:', error);
      return {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble generating a response right now. Please try asking about your yoga practice again!",
        isUser: false,
        timestamp: new Date()
      };
    }
  };

  const handleApplySequence = (trainingSteps: TrainingSteps) => {
    if (onTrainingPlanGenerated) {
      onTrainingPlanGenerated(trainingSteps);
      // Add confirmation message
      const confirmMessage: Message = {
        id: Date.now().toString(),
        text: "✅ Perfect! I've applied the yoga sequence to your training steps. You can now see the asanas in their respective phases and make any adjustments you'd like!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiMessage = await generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h3>Yoga AI Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>
          
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.isUser ? styles.userMessage : styles.aiMessage
                }`}
              >
                <div className={styles.messageText}>{message.text}</div>
                {message.hasTrainingPlan && message.trainingSteps && (
                  <button
                    onClick={() => handleApplySequence(message.trainingSteps!)}
                    className={styles.applyButton}
                  >
                    ✨ Apply Sequence
                  </button>
                )}
                <div className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.aiMessage}`}>
                <div className={styles.messageText}>
                  <div className={styles.loadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask for a yoga training plan..."
              className={styles.messageInput}
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={styles.sendButton}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.fabButton}
        title="Open Yoga AI Assistant"
      >
        🧘‍♀️
      </button>
    </div>
  );
};