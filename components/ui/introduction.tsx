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
      description: "Nine powerful features designed for modern academic success"
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
      <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-4">
        {/* Main content - simplified animation */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-unbounded">
            Welcome to EDEN
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12">
            Your Educational Development Environment
          </p>
        </motion.div>

        {/* Features - optimized animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`p-4 sm:p-6 rounded-lg border transition-all duration-300 ${
                currentFeature >= index 
                  ? 'border-white/20 bg-black' 
                  : 'border-white/5 bg-transparent'
              }`}
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: currentFeature >= index ? 1 : 0.3,
                scale: currentFeature === index ? 1.02 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <feature.icon 
                className={`w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4 transition-colors duration-300 ${
                  currentFeature >= index ? 'text-white' : 'text-white/30'
                }`} 
              />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Enter button - fixed visibility */}
        {showEnter && (
          <motion.div
            className="text-center mb-16 sm:mb-24 lg:mb-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <button
              onClick={onComplete}
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors duration-300 font-unbounded border-2 border-white"
            >
              DISCOVER EDEN
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* Progress dots */}
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
          {features.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentFeature >= index ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 