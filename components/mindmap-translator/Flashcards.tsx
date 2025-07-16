import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Flipper, Flipped } from 'react-flip-toolkit';
import { TextProcessor, FlashcardData } from '@/lib/text-processing';

interface FlashcardsProps {
  text: string;
}

export default function Flashcards({ text }: FlashcardsProps) {
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate flashcards when text changes
  useEffect(() => {
    const generateCards = async () => {
      setIsLoading(true);
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const generatedCards = TextProcessor.generateFlashcards(text);
      setCards(generatedCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsLoading(false);
    };
    
    if (text.trim()) {
      generateCards();
    }
  }, [text]);
  
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
      e.preventDefault();
      setIsFlipped(prev => !prev);
    }
  }, [cards.length]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };
  
  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'hard': return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mb-4"></div>
        <p className="text-text-secondary">Generating flashcards from your notes...</p>
      </div>
    );
  }
  
  if (!currentCard) {
    return (
      <div className="text-center text-text-secondary p-8">
        <div className="mb-4">
          <RotateCcw size={48} className="mx-auto opacity-40" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No flashcards generated</h3>
        <p>The text doesn't contain enough structured content to create flashcards.</p>
        <p className="text-sm mt-2">Try adding:</p>
        <ul className="text-sm mt-2 list-disc list-inside space-y-1">
          <li>Definitions (term - definition)</li>
          <li>Concepts (X is Y)</li>
          <li>Process steps</li>
          <li>Facts and explanations</li>
        </ul>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <p className="text-text-secondary">
            Card {currentIndex + 1} of {cards.length}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Difficulty:</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(currentCard.difficulty)} bg-white/10`}>
              {currentCard.difficulty}
            </span>
          </div>
        </div>
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
        flipKey={`${currentIndex}-${isFlipped}`}
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
              {/* Front - Question */}
              <div className="absolute inset-0 backface-hidden">
                <div className="h-full flex flex-col justify-center p-6 bg-background rounded-xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-blue-400">Question</span>
                    <span className="text-xs text-text-secondary">
                      Concept: {currentCard.concept}
                    </span>
                  </div>
                  <p className="text-lg text-white font-medium text-center flex-1 flex items-center justify-center">
                    {currentCard.question}
                  </p>
                  <div className="text-center mt-4">
                    <p className="text-xs text-text-secondary">Click or press space to reveal answer</p>
                  </div>
                </div>
              </div>
              
              {/* Back - Answer */}
              <div className="absolute inset-0 backface-hidden rotate-y-180">
                <div className={`h-full flex flex-col justify-center p-6 ${getDifficultyBg(currentCard.difficulty)} rounded-xl`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-white/90">Answer</span>
                    <span className="text-xs text-white/70">
                      {currentCard.difficulty} level
                    </span>
                  </div>
                  <p className="text-lg text-white text-center flex-1 flex items-center justify-center">
                    {currentCard.answer}
                  </p>
                  <div className="text-center mt-4">
                    <p className="text-xs text-white/70">Click or press space to see question</p>
                  </div>
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
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        
        <div className="flex gap-1">
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => {
                setCurrentIndex(i);
                setIsFlipped(false);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === currentIndex ? getDifficultyBg(card.difficulty) : 'bg-white/20 hover:bg-white/30'
              }`}
              title={`Card ${i + 1}: ${card.concept} (${card.difficulty})`}
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
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>
      
      {/* Study Progress */}
      <div className="mt-6 p-4 bg-background rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Study Progress</span>
          <span className="text-sm text-text-secondary">
            {Math.round(((currentIndex + 1) / cards.length) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-secondary mt-2">
          <span>Easy: {cards.filter(c => c.difficulty === 'easy').length}</span>
          <span>Medium: {cards.filter(c => c.difficulty === 'medium').length}</span>
          <span>Hard: {cards.filter(c => c.difficulty === 'hard').length}</span>
        </div>
      </div>
    </div>
  );
} 