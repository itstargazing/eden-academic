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
    // Simple profile determination logic
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
    <div className="space-y-8 p-6 bg-background rounded-lg border border-white/10">
      <h3 className="text-xl font-semibold text-white">Cognitive Style Quiz</h3>
      
      <div className="space-y-6">
        {questions.map((q) => {
          const Icon = q.icon;
          return (
            <div key={q.id} className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Icon size={18} className="text-blue-500" />
                <span className="text-sm">{q.question}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {q.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(q.id, option)}
                    className={`p-2 rounded-md text-xs transition-colors ${
                      answers[q.id] === option
                        ? 'bg-white/20 text-white'
                        : 'bg-background hover:bg-white/10 text-white/70'
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
          onClick={() => onComplete(determineProfile())}
          className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
        >
          Complete Profile
        </button>
      )}
    </div>
  );
} 