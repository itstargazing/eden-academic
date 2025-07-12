import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Clock } from 'lucide-react';

interface IntroductionProps {
  onComplete: () => void;
}

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Tools",
    description: "Advanced AI algorithms to enhance your academic workflow"
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Research Assistant",
    description: "Smart tools for better research organization and writing"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Focus Enhancement",
    description: "Optimize your study environment and track progress"
  }
];

export default function Introduction({ onComplete }: IntroductionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-12">
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="card p-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="icon-container w-12 h-12 flex items-center justify-center text-accent">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="text-text-secondary">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      <motion.button
        onClick={onComplete}
        className="btn btn-primary group flex items-center gap-2 px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Explore Tools
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  );
} 