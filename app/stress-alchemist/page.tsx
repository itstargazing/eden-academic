"use client";

import { useState, useEffect, useRef } from "react";
import { HeartPulse, Activity, Calendar, BookOpen, Brain, MessageSquare, Zap, ArrowRight, BatteryFull, Play, Pause, RotateCcw, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function StressAlchemistPage() {
  const [mood, setMood] = useState("neutral");
  const [activeTab, setActiveTab] = useState("today");
  const [energyLevel, setEnergyLevel] = useState(75);
  const [stressLevel, setStressLevel] = useState("medium");
  
  // Breathing exercise states
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState("ready"); // ready, inhale, hold, exhale
  const [breathCount, setBreathCount] = useState(0);
  const [breathCycles, setBreathCycles] = useState(0);
  
  // AI Therapist states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "I notice you've been working late for the third night in a row. Is there a deadline you're concerned about?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFreeChat, setShowFreeChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Exercise tracking
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [exerciseText, setExerciseText] = useState("");
  
  // Breathing exercise logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathCount(prev => {
          if (prev >= 4) {
            // Change phase
            setBreathPhase(current => {
              if (current === "inhale") return "hold";
              if (current === "hold") return "exhale";
              if (current === "exhale") {
                setBreathCycles(c => c + 1);
                return "inhale";
              }
              return "inhale";
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isBreathing, breathPhase]);
  
  // Stop breathing after 5 cycles
  useEffect(() => {
    if (breathCycles >= 5 && isBreathing) {
      setIsBreathing(false);
      setBreathPhase("ready");
      setBreathCount(0);
      alert("Great job! You've completed 5 breathing cycles. How do you feel?");
    }
  }, [breathCycles, isBreathing]);
  
  const startBreathing = () => {
    setIsBreathing(true);
    setBreathPhase("inhale");
    setBreathCount(0);
    setBreathCycles(0);
  };
  
  const stopBreathing = () => {
    setIsBreathing(false);
    setBreathPhase("ready");
    setBreathCount(0);
    setBreathCycles(0);
  };
  
  // AI Therapist functions
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const generateAIResponse = (userText: string) => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes("paper") || lowerText.includes("deadline")) {
      return "I understand the pressure of upcoming deadlines. Let's break this down - what specific part of the paper is causing you the most stress? Sometimes tackling it piece by piece can make it feel more manageable.";
    } else if (lowerText.includes("procrastinat")) {
      return "Procrastination often stems from perfectionism or feeling overwhelmed. What if we start with just 15 minutes of work? You might find that starting is the hardest part. Would you like to try the Pomodoro technique together?";
    } else if (lowerText.includes("stress") || lowerText.includes("anxious")) {
      return "I hear that you're feeling stressed. That's completely valid given your workload. Have you tried the breathing exercise on this page? It can help activate your parasympathetic nervous system and reduce immediate stress. What usually helps you feel calmer?";
    } else if (lowerText.includes("tired") || lowerText.includes("exhausted")) {
      return "Fatigue can really impact our academic performance. When did you last take a proper break? Sometimes a 20-minute walk or power nap can be more productive than pushing through exhaustion. What's your sleep schedule been like lately?";
    } else if (lowerText.includes("thank")) {
      return "You're very welcome! Remember, seeking support is a sign of strength, not weakness. I'm here whenever you need to talk. How are you feeling now compared to when we started chatting?";
    } else {
      return "I hear you. Can you tell me more about what's on your mind? Sometimes just expressing our thoughts can help clarify what we're really dealing with.";
    }
  };
  
  const handleQuickResponse = (response: string) => {
    sendMessage(response);
    setShowFreeChat(true);
  };
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Update mood effects
  useEffect(() => {
    // Update energy and stress based on mood
    switch(mood) {
      case "stressed":
        setEnergyLevel(45);
        setStressLevel("high");
        break;
      case "tired":
        setEnergyLevel(30);
        setStressLevel("medium");
        break;
      case "neutral":
        setEnergyLevel(60);
        setStressLevel("medium");
        break;
      case "focused":
        setEnergyLevel(80);
        setStressLevel("low");
        break;
      case "energized":
        setEnergyLevel(95);
        setStressLevel("low");
        break;
    }
  }, [mood]);
  
  const startExercise = () => {
    setExerciseStarted(true);
    setExerciseText("");
  };
  
  const completeExercise = () => {
    if (exerciseText.trim()) {
      alert("Great work on completing the resilience exercise! Remember, every setback is an opportunity to grow stronger.");
      setExerciseStarted(false);
      setExerciseText("");
      // Improve mood after exercise
      if (mood === "stressed" || mood === "tired") {
        setMood("neutral");
      }
    }
  };
  
  return (
    <div className="space-y-8 feature-page">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <HeartPulse size={32} className="text-red-500" />
          </div>
          <div>
            <h1 className="page-header">Stress Alchemist</h1>
            <p className="text-text-secondary">AI mental resilience builder for academics</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title mb-6">Mental Weather Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background p-5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Today's Energy</h3>
              <div className="icon-container">
                <BatteryFull size={18} className="text-red-500" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold text-white">{energyLevel}%</div>
              <div className="text-xs text-text-secondary pb-1">
                {energyLevel > 75 ? "High energy!" : energyLevel > 50 ? "Moderate" : "Low - rest needed"}
              </div>
            </div>
            <div className="w-full bg-primary rounded-full h-2 mt-3">
              <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${energyLevel}%` }}></div>
            </div>
          </div>
          
          <div className="bg-background p-5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Stress Level</h3>
              <div className="icon-container">
                <Activity size={18} className="text-red-500" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold text-white capitalize">{stressLevel}</div>
              <div className="text-xs text-text-secondary pb-1">
                {stressLevel === "low" ? "Great!" : stressLevel === "medium" ? "Manageable" : "Let's work on this"}
              </div>
            </div>
            <div className="flex justify-between mt-3">
              <span className={`text-xs ${stressLevel === "low" ? "text-white font-bold" : "text-text-secondary"}`}>Low</span>
              <span className={`text-xs ${stressLevel === "medium" ? "text-white font-bold" : "text-text-secondary"}`}>Medium</span>
              <span className={`text-xs ${stressLevel === "high" ? "text-white font-bold" : "text-text-secondary"}`}>High</span>
            </div>
          </div>
          
          <div className="bg-background p-5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">How do you feel?</h3>
              <div className="icon-container">
                <Brain size={18} className="text-red-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 my-2">
              {["stressed", "tired", "neutral", "focused", "energized"].map((moodOption) => (
                <button 
                  key={moodOption}
                  className={`p-2 rounded-md text-xs text-center transition-colors ${
                    mood === moodOption 
                      ? 'bg-white text-black' 
                      : 'bg-primary border border-white/10 text-text-secondary hover:text-white'
                  }`}
                  onClick={() => setMood(moodOption)}
                >
                  {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:flex-[2]">
          <section className="card h-full">
            <div className="flex flex-wrap border-b border-white/10 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "border-white text-white"
                      : "border-transparent text-text-secondary hover:text-white"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={16} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
            
            <div className="space-y-6">
              {activeTab === "today" && (
                <>
                  <div className="bg-background border border-white/20 p-5 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-white mt-1">
                        <Zap size={20} className="text-black" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-2">Today's Resilience Challenge</h3>
                        <p className="text-text-secondary mb-4">Practice reframing a recent academic setback as a learning opportunity. Spend 3 minutes writing down what you learned and how it might benefit you in the future.</p>
                        
                        {!exerciseStarted ? (
                          <button onClick={startExercise} className="btn btn-primary flex items-center gap-2">
                            <span>Start Exercise</span>
                            <ArrowRight size={16} />
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <textarea
                              className="w-full p-3 bg-primary border border-white/10 rounded-md text-white"
                              rows={4}
                              placeholder="Describe a recent setback and what you learned from it..."
                              value={exerciseText}
                              onChange={(e) => setExerciseText(e.target.value)}
                            />
                            <button 
                              onClick={completeExercise}
                              disabled={!exerciseText.trim()}
                              className="btn btn-primary"
                            >
                              Complete Exercise
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 rounded-lg bg-background border border-white/10 h-full">
                    <h3 className="text-lg font-medium text-white mb-3">Mindfulness Micro-Break</h3>
                    <p className="text-text-secondary mb-4">Your calendar shows 3 consecutive meetings this afternoon. Consider taking a 2-minute breathing break between each one.</p>
                    
                    <div className="p-6 bg-primary rounded-md border border-white/10">
                      <div className="text-center">
                        {!isBreathing && breathPhase === "ready" && (
                          <>
                            <p className="text-text-secondary mb-4">Ready for a quick breathing exercise?</p>
                            <button onClick={startBreathing} className="btn btn-primary mx-auto flex items-center gap-2">
                              <Play size={20} />
                              <span>Start Breathing Exercise</span>
                            </button>
                          </>
                        )}
                        
                        {isBreathing && (
                          <div className="space-y-4">
                            <div className="text-4xl font-bold text-white">
                              {breathPhase === "inhale" && "Breathe In..."}
                              {breathPhase === "hold" && "Hold..."}
                              {breathPhase === "exhale" && "Breathe Out..."}
                            </div>
                            <div className="text-6xl font-mono text-white">{breathCount}</div>
                            <div className="text-sm text-text-secondary">Cycle {breathCycles + 1} of 5</div>
                            
                            <div className="flex justify-center gap-2 mt-4">
                              <button onClick={stopBreathing} className="btn btn-secondary">
                                <Pause size={16} />
                                Pause
                              </button>
                              <button onClick={() => { stopBreathing(); startBreathing(); }} className="btn btn-secondary">
                                <RotateCcw size={16} />
                                Restart
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {!isBreathing && breathCycles > 0 && breathCycles < 5 && (
                          <div className="space-y-4">
                            <p className="text-text-secondary">Paused at cycle {breathCycles} of 5</p>
                            <button onClick={() => setIsBreathing(true)} className="btn btn-primary mx-auto">
                              <Play size={20} />
                              Resume
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === "insights" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-lg bg-background border border-white/10">
                    <h3 className="text-lg font-medium text-white mb-3">Weekly Patterns</h3>
                    <p className="text-text-secondary mb-4">Based on your data, we've observed the following patterns:</p>
                    
                    <div className="space-y-4">
                      {insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="icon-container">
                            <insight.icon size={16} className="text-red-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{insight.title}</h4>
                            <p className="text-sm text-text-secondary">{insight.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-5 rounded-lg bg-background border border-white/10">
                    <h3 className="text-lg font-medium text-white mb-3">Academic Pressure Points</h3>
                    <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
                      <span>Low Stress</span>
                      <span>High Stress</span>
                    </div>
                    
                    {pressurePoints.map((point, index) => (
                      <div key={index} className="mb-3 last:mb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{point.activity}</span>
                          <span className="text-xs text-text-secondary">{point.level}/10</span>
                        </div>
                        <div className="w-full bg-primary rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-white transition-all duration-500" 
                            style={{ width: `${point.level * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === "history" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-lg bg-background border border-white/10">
                    <h3 className="text-lg font-medium text-white mb-3">Mood Calendar</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <div 
                          key={day} 
                          className={`aspect-square flex items-center justify-center rounded-md text-sm cursor-pointer transition-colors ${
                            day <= 15 
                              ? 'bg-primary border border-white/10 text-text-secondary hover:border-white/30' 
                              : day === new Date().getDate() 
                                ? 'bg-white text-black' 
                                : 'bg-background border border-white/10 text-text-secondary hover:border-white/30'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-5 rounded-lg bg-background border border-white/10">
                    <h3 className="text-lg font-medium text-white mb-3">Progress Over Time</h3>
                    <p className="text-text-secondary mb-4">You've completed 12 resilience exercises this month. Your average stress level has decreased from 7.2 to 5.4.</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Exercises Completed</span>
                        <span className="text-white">12/20</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Breathing Sessions</span>
                        <span className="text-white">8 sessions</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Average Mood</span>
                        <span className="text-white">Improving ↑</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <button className="text-white hover:text-text-secondary text-sm">View Detailed Analytics</button>
                      <button className="text-white hover:text-text-secondary text-sm">Export Data</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
        
        <div className="lg:flex-1">
          <section className="card sticky top-8 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">AI Therapist</h2>
              <div className="icon-container">
                <MessageSquare size={18} className="text-red-500" />
              </div>
            </div>
            
            <div 
              ref={chatContainerRef}
              className="h-64 overflow-y-auto mb-4 space-y-3"
            >
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg text-sm ${
                    message.isUser 
                      ? "bg-white text-black ml-4" 
                      : "bg-background border border-white/10 text-text-secondary mr-4"
                  }`}
                >
                  {message.text}
                </div>
              ))}
              
              {isTyping && (
                <div className="bg-background border border-white/10 p-3 rounded-lg mr-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              )}
            </div>
            
            {!showFreeChat && chatMessages.length === 1 && (
              <div className="space-y-2 mb-4">
                <button 
                  onClick={() => handleQuickResponse("Yes, I have a paper due tomorrow I'm not ready for.")}
                  className="w-full p-2 text-sm text-left rounded-md bg-background hover:bg-primary border border-white/10 text-text-secondary"
                >
                  Yes, I have a paper due tomorrow I'm not ready for.
                </button>
                <button 
                  onClick={() => handleQuickResponse("I'm trying to get ahead on my workload.")}
                  className="w-full p-2 text-sm text-left rounded-md bg-background hover:bg-primary border border-white/10 text-text-secondary"
                >
                  I'm trying to get ahead on my workload.
                </button>
                <button 
                  onClick={() => handleQuickResponse("I've been procrastinating and now I'm behind.")}
                  className="w-full p-2 text-sm text-left rounded-md bg-background hover:bg-primary border border-white/10 text-text-secondary"
                >
                  I've been procrastinating and now I'm behind.
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(userInput)}
                placeholder="Type your message..."
                className="flex-1 p-2 bg-background border border-white/10 rounded-md text-white text-sm"
              />
              <button 
                onClick={() => sendMessage(userInput)}
                disabled={!userInput.trim()}
                className="btn btn-primary p-2"
              >
                <Send size={16} />
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <button 
                onClick={() => {
                  setChatMessages([{
                    id: "1",
                    text: "Hello! I'm here to support you. How are you feeling today?",
                    isUser: false,
                    timestamp: new Date()
                  }]);
                  setShowFreeChat(false);
                }}
                className="text-text-secondary hover:text-white text-sm"
              >
                Start Fresh
              </button>
              <button 
                onClick={() => setShowFreeChat(true)}
                className="btn btn-secondary py-1 px-3 text-sm"
              >
                Chat Freely
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: "today", name: "Today", icon: Calendar },
  { id: "insights", name: "Insights", icon: BookOpen },
  { id: "history", name: "History", icon: Activity }
];

const insights = [
  {
    icon: Brain,
    title: "Focus Peaks in Morning",
    description: "Your concentration appears strongest between 8-11am. Consider scheduling complex tasks during this time."
  },
  {
    icon: Calendar,
    title: "Midweek Stress",
    description: "Wednesdays consistently show elevated stress levels. You might benefit from lighter scheduling on these days."
  },
  {
    icon: Activity,
    title: "Exercise Impact",
    description: "Days following physical activity show 40% better mood ratings and improved sleep quality."
  }
];

const pressurePoints = [
  { activity: "Exams & Assessments", level: 8 },
  { activity: "Group Projects", level: 6 },
  { activity: "Research Work", level: 4 },
  { activity: "Class Presentations", level: 7 },
  { activity: "Reading Assignments", level: 3 }
]; 