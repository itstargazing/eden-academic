import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, BookOpen, Users, ChevronRight } from 'lucide-react';

interface IntroductionProps {
  onComplete: () => void;
}

export default function Introduction({ onComplete }: IntroductionProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [showEnter, setShowEnter] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "Academic Excellence",
      description: "Transform your research and study experience with AI-powered tools"
    },
    {
      icon: Sparkles,
      title: "Smart Collaboration",
      description: "Connect with peers and mentors in innovative virtual spaces"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Tools",
      description: "Seven powerful features designed for modern academic success"
    },
    {
      icon: Users,
      title: "Join the Future",
      description: "Be part of the next generation of academic achievement"
    }
  ];

  useEffect(() => {
    // Auto-advance features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => {
        if (prev === features.length - 1) {
          setShowEnter(true);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-background flex items-center justify-center">
      <div className="max-w-4xl w-full px-4">
        {/* Main content */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold text-text-primary mb-6 font-logo">
            Welcome to EDEN
          </h1>
          <p className="text-xl text-text-secondary mb-12">
            Your Educational Development Environment
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-lg border ${
                currentFeature >= index 
                  ? 'border-accent/20 bg-primary' 
                  : 'border-accent/5 bg-transparent'
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ 
                opacity: currentFeature >= index ? 1 : 0.3,
                x: 0,
                scale: currentFeature === index ? 1.05 : 1,
                transitionEnd: {
                  scale: 1
                }
              }}
              transition={{ duration: 0.5 }}
            >
              <feature.icon 
                className={`w-8 h-8 mb-4 ${
                  currentFeature >= index ? 'text-accent' : 'text-accent/30'
                }`} 
              />
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Enter button */}
        {showEnter && (
          <motion.div
            className="text-center mb-40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={onComplete}
              className="group inline-flex items-center gap-2 px-8 py-3 text-sm bg-highlight text-black font-medium rounded-md hover:bg-highlight/90 transition-colors duration-300 font-logo border-2 border-highlight"
            >
              DISCOVER EDEN
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* Progress dots */}
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
          {features.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentFeature >= index ? 'bg-accent' : 'bg-accent/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 