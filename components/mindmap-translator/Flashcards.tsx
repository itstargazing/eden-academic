import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Flipper, Flipped } from 'react-flip-toolkit';

interface FlashcardsProps {
  text: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const generateFlashcards = (text: string): Flashcard[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const cards: Flashcard[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Try to identify definition patterns
    if (trimmedLine.includes(' - ') || trimmedLine.includes(': ')) {
      const [term, definition] = trimmedLine.split(/\s*[-:]\s*/);
      if (term && definition) {
        cards.push({
          id: `card-${index}`,
          question: `What is ${term.trim()}?`,
          answer: definition.trim()
        });
        return;
      }
    }
    
    // Try to identify concept explanations
    if (trimmedLine.includes(' is ') || trimmedLine.includes(' are ')) {
      const parts = trimmedLine.split(/\s+(is|are)\s+/);
      if (parts.length === 2) {
        cards.push({
          id: `card-${index}`,
          question: `What ${parts[0].includes(' ') ? 'are' : 'is'} ${parts[0].trim()}?`,
          answer: parts[1].trim()
        });
        return;
      }
    }
    
    // For other lines, create a general understanding question
    if (trimmedLine.length > 10) {
      cards.push({
        id: `card-${index}`,
        question: `Explain: ${trimmedLine.slice(0, 40)}...`,
        answer: trimmedLine
      });
    }
  });
  
  return cards;
};

export default function Flashcards({ text }: FlashcardsProps) {
  const [cards] = useState(() => generateFlashcards(text));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  
  const currentCard = cards[currentIndex];
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setDirection('left');
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
      setIsFlipped(false);
    } else if (e.key === 'ArrowRight') {
      setDirection('right');
      setCurrentIndex(prev => (prev < cards.length - 1 ? prev + 1 : prev));
      setIsFlipped(false);
    } else if (e.key === ' ') {
      setIsFlipped(prev => !prev);
    }
  }, [cards.length]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  if (!currentCard) {
    return (
      <div className="text-center text-text-secondary p-8">
        No flashcards could be generated from the provided text.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-text-secondary">
          Card {currentIndex + 1} of {cards.length}
        </p>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>Use arrow keys to navigate</span>
          <span className="px-2 py-1 bg-background rounded">←</span>
          <span className="px-2 py-1 bg-background rounded">→</span>
          <span>and</span>
          <span className="px-2 py-1 bg-background rounded">space</span>
          <span>to flip</span>
        </div>
      </div>
      
      <Flipper
        flipKey={currentIndex}
        spring={{ stiffness: 300, damping: 30 }}
      >
        <div className="relative perspective-1000">
          <Flipped flipId="card">
            <div
              className={`relative w-full aspect-[3/2] cursor-pointer transition-transform duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={() => setIsFlipped(prev => !prev)}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden">
                <div className="h-full flex flex-col justify-center p-6 bg-primary rounded-xl border border-white/20">
                  <p className="text-xs text-green-400 mb-3">Question</p>
                  <p className="text-lg text-white font-medium text-center">
                    {currentCard.question}
                  </p>
                </div>
              </div>
              
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180">
                <div className="h-full flex flex-col justify-center p-6 bg-green-600 rounded-xl">
                  <p className="text-xs text-green-100 mb-3">Answer</p>
                  <p className="text-lg text-white text-center">
                    {currentCard.answer}
                  </p>
                </div>
              </div>
            </div>
          </Flipped>
        </div>
      </Flipper>
      
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => {
            setDirection('left');
            setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
            setIsFlipped(false);
          }}
          disabled={currentIndex === 0}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        
        <div className="flex gap-1">
          {cards.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === currentIndex ? 'bg-green-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={() => {
            setDirection('right');
            setCurrentIndex(prev => (prev < cards.length - 1 ? prev + 1 : prev));
            setIsFlipped(false);
          }}
          disabled={currentIndex === cards.length - 1}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
} 