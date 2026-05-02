"use client";

import { useState } from 'react';
import { Brain, Clock, Activity, Focus, Timer } from 'lucide-react';
import { CognitiveProfile } from '@/types';

const questions = [
  {
    id: 'time',
    question: 'When are you most productive?',
    options: ['Early Morning', 'Late Morning', 'Afternoon', 'Evening', 'Night'],
    icon: Clock
  },
  {
    id: 'style',
    question: 'How do you learn best?',
    options: ['Visual (images/diagrams)', 'Verbal (reading/writing)', 'Kinesthetic (hands-on)'],
    icon: Brain
  },
  {
    id: 'distraction',
    question: 'How easily are you distracted?',
    options: ['Rarely', 'Sometimes', 'Often'],
    icon: Focus
  },
  {
    id: 'adhd',
    question: 'Do you have ADHD or similar attention challenges?',
    options: ['Yes', 'No', 'Prefer not to say'],
    icon: Activity
  },
  {
    id: 'duration',
    question: 'What\'s your ideal study session length?',
    options: ['15-25 minutes', '25-45 minutes', '45-60 minutes', '60+ minutes'],
    icon: Timer
  }
];

export default function CognitiveQuiz({ onComplete }: { onComplete: (profile: CognitiveProfile) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const determineProfile = () => {
    const timePreference = answers.time?.includes('Morning') ? 'Early Bird' : 'Night Owl';
    const style = answers.style?.includes('Visual') ? 'Visual' : 
                 answers.style?.includes('Verbal') ? 'Verbal' : 'Kinesthetic';
    const focus = answers.distraction === 'Rarely' ? 'Deep' : 
                 answers.distraction === 'Sometimes' ? 'Moderate' : 'Sprint';
    
    return {
      type: `${style} ${timePreference}`,
      focusStyle: focus,
      answers
    };
  };

  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <div className="space-y-8 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-6">
      <h3 className="text-xl font-semibold text-[var(--text)]">Cognitive Style Quiz</h3>
      
      <div className="space-y-6">
        {questions.map((q) => {
          const Icon = q.icon;
          return (
            <div key={q.id} className="space-y-4">
              <div className="flex items-center gap-3 text-[var(--text)]">
                <Icon size={18} className="text-[var(--text-dim)]" />
                <span className="text-sm">{q.question}</span>
              </div>
              
              <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-3">
                {q.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAnswer(q.id, option)}
                    className={`min-w-0 rounded-md p-2 text-left text-xs transition-colors ${
                      answers[q.id] === option
                        ? 'border border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                        : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isComplete && (
        <button
          type="button"
          onClick={() => onComplete(determineProfile())}
          className="btn btn-primary w-full py-2 px-4"
        >
          Complete Profile
        </button>
      )}
    </div>
  );
}
