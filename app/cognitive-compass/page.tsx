"use client";

import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import CognitiveQuiz from '@/components/cognitive-compass/CognitiveQuiz';
import FocusPulse from '@/components/cognitive-compass/FocusPulse';
import SuggestionPanel from '@/components/cognitive-compass/SuggestionPanel';
import { CognitiveProfile, PulseData } from '@/types';

export default function CognitiveCompassPage() {
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [pulseData, setPulseData] = useState<PulseData | null>(null);
  const [showQuiz, setShowQuiz] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('cognitiveProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setShowQuiz(false);
    }
  }, []);

  const handleQuizComplete = (profileData: CognitiveProfile) => {
    setProfile(profileData);
    localStorage.setItem('cognitiveProfile', JSON.stringify(profileData));
    setShowQuiz(false);
  };

  const handlePulseUpdate = (data: PulseData) => {
    setPulseData(data);
    localStorage.setItem('lastPulseData', JSON.stringify(data));
  };

  return (
    <div className="space-y-8 feature-page">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <Brain size={32} className="text-blue-500" />
          </div>
          <div>
            <h1 className="page-header">Cognitive Compass</h1>
            <p className="text-text-secondary">Understand your focus patterns and optimize your study environment</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showQuiz ? (
          <div className="lg:col-span-2 card">
            <CognitiveQuiz onComplete={handleQuizComplete} />
          </div>
        ) : (
          <>
            <div className="card">
              <FocusPulse onUpdate={handlePulseUpdate} />
            </div>
            
            {profile && pulseData && (
              <div className="card">
                <SuggestionPanel profile={profile} pulseData={pulseData} />
              </div>
            )}
          </>
        )}
      </div>

      {!showQuiz && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowQuiz(true)}
            className="btn btn-secondary text-sm"
          >
            Retake Cognitive Quiz
          </button>
        </div>
      )}
    </div>
  );
} 