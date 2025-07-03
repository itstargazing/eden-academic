"use client";

import { useState, useEffect } from "react";
import { BookOpen, Upload, Calendar, CheckCircle, Clock, FileText, Lightbulb, AlertCircle, ArrowRight, Save, Folder, Archive, Copy, Download, X, Brain } from "lucide-react";
import { useUserStore, CourseTimeline } from "@/store/user-store";
import { v4 as uuidv4 } from 'uuid';
import { Course } from '@/types';

interface SmartNotes {
  courseOverview: {
    title: string;
    instructor: string;
    officeHours: string;
  };
  weeklyTopics: string[];
  grading: string[];
  importantDates: string[];
  materials: string[];
  policies: string[];
}

export default function SyllabusWhispererPage() {
  const [syllabusText, setSyllabusText] = useState("");
  const [activeTab, setActiveTab] = useState("timeline");
  const [isProcessed, setIsProcessed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedTitle, setProcessedTitle] = useState("");
  const [processedItems, setProcessedItems] = useState<CourseTimeline[]>([]);
  const [processProgress, setProcessProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedCoursesModal, setShowSavedCoursesModal] = useState(false);
  const [smartNotes, setSmartNotes] = useState<SmartNotes | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [showSmartNotesPanel, setShowSmartNotesPanel] = useState(false);
  
  // Get user state from store
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const courses = useUserStore(state => state.courses);
  const addCourse = useUserStore(state => state.addCourse);
  const updateCourseItem = useUserStore(state => state.updateCourseItem);
  
  const processSyllabus = () => {
    if (!syllabusText.trim()) return;
    
    setIsProcessing(true);
    setProcessProgress(0);
    
    // Create intervals to simulate processing steps
    const interval = setInterval(() => {
      setProcessProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    // Extract information from syllabus text
    setTimeout(() => {
      // Very simple keyword extraction for demo purposes
      const lines = syllabusText.split(/\n+/);
      let courseTitle = "";
      
      // Try to identify the course title from first few lines
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        if (line && (line.includes("Course") || line.includes("class") || line.length > 20 && line.length < 100)) {
          courseTitle = line;
          break;
        }
      }
      
      if (!courseTitle && lines.length > 0) {
        courseTitle = lines[0]; // Fallback to first line
      }
      
      setProcessedTitle(courseTitle || "Course Syllabus");
      
      // Extract potential due dates and assignments
      const dateRegex = /(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)/i;
      const assignmentKeywords = ['assignment', 'project', 'paper', 'essay', 'report', 'presentation', 'exam', 'quiz', 'test', 'midterm', 'final'];
      
      const extractedItems = [];
      
      // Process the syllabus text line by line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        
        // Check if line contains a date
        const dateMatch = line.match(dateRegex);
        if (dateMatch) {
          // Check if line contains assignment keywords
          const hasAssignmentKeyword = assignmentKeywords.some(keyword => line.includes(keyword));
          
          if (hasAssignmentKeyword) {
            // Format the title - use the original case
            let title = lines[i].trim();
            if (title.length > 60) {
              title = title.substring(0, 57) + '...';
            }
            
            extractedItems.push({
              id: uuidv4(), // Generate unique ID
              title: title,
              date: dateMatch[0],
              description: "Extracted from syllabus",
              isCompleted: false,
              isDue: Math.random() < 0.3 // Randomly mark some as due soon for demo
            });
          }
        }
      }
      
      // If we couldn't extract real items, use our pre-defined ones
      const finalItems = extractedItems.length > 0 ? extractedItems : timelineItems.map(item => ({
        ...item,
        id: uuidv4() // Add IDs to predefined items
      }));
      
      setProcessedItems(finalItems);
      
      setIsProcessing(false);
      setIsProcessed(true);
    }, 2500);
  };
  
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result;
      if (content && typeof content === 'string') {
        setSyllabusText(content);
      }
    };
    reader.readAsText(file);
  };
  
  // Save the current course to user store
  const saveCourse = () => {
    if (!isLoggedIn) {
      alert("Please log in to save courses");
      return;
    }
    
    setIsSaving(true);
    
    setTimeout(() => {
      const courseId = uuidv4();
      addCourse({
        id: courseId,
        title: processedTitle,
        timeline: processedItems
      });
      setIsSaving(false);
    }, 500);
  };
  
  // Load a saved course
  const loadCourse = (course: Course) => {
    setProcessedTitle(course.title);
    setProcessedItems(course.timeline);
    setIsProcessed(true);
    setShowSavedCoursesModal(false);
  };
  
  // Handle completing a task
  const toggleTaskComplete = (itemId: string) => {
    const updatedItems = processedItems.map(item => 
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setProcessedItems(updatedItems);
    
    // If the course is already saved in user store, update it there too
    const existingCourse = courses.find(course => 
      course.timeline.some(item => item.id === itemId)
    );
    
    if (existingCourse) {
      const item = existingCourse.timeline.find(item => item.id === itemId);
      if (item) {
        updateCourseItem(existingCourse.id, itemId, !item.isCompleted);
      }
    }
  };

  // Generate Smart Notes from syllabus
  const generateSmartNotes = () => {
    if (!syllabusText.trim()) {
      alert("Please process a syllabus first.");
      return;
    }

    setIsGeneratingNotes(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const lines = syllabusText.split(/\n+/).filter(line => line.trim());
      
      // Extract course info
      let courseTitle = processedTitle || "Course";
      let instructor = "";
      let officeHours = "";
      
      // Look for instructor info
      const instructorLine = lines.find(line => 
        line.toLowerCase().includes("professor") || 
        line.toLowerCase().includes("instructor") ||
        line.toLowerCase().includes("taught by")
      );
      if (instructorLine) {
        instructor = instructorLine.replace(/professor:?/i, '').replace(/instructor:?/i, '').trim();
      }
      
      // Look for office hours
      const officeHoursLine = lines.find(line => 
        line.toLowerCase().includes("office hours")
      );
      if (officeHoursLine) {
        officeHours = officeHoursLine.replace(/office hours:?/i, '').trim();
      }
      
      // Extract weekly topics
      const weeklyTopics: string[] = [];
      lines.forEach(line => {
        if (line.toLowerCase().includes("week") && 
            (line.includes(":") || line.includes("-")) &&
            !line.toLowerCase().includes("exam")) {
          weeklyTopics.push(line.trim());
        }
      });
      
      // Extract grading info
      const gradingInfo: string[] = [];
      lines.forEach(line => {
        if (line.includes("%") || 
            (line.toLowerCase().includes("grading") || 
             line.toLowerCase().includes("grade") ||
             line.toLowerCase().includes("points"))) {
          gradingInfo.push(line.trim());
        }
      });
      
      // Extract important dates
      const importantDates = processedItems.filter(item => 
        item.title.toLowerCase().includes("exam") || 
        item.title.toLowerCase().includes("midterm") ||
        item.title.toLowerCase().includes("final")
      );
      
      // Extract materials
      const materials: string[] = [];
      lines.forEach(line => {
        if (line.toLowerCase().includes("textbook") ||
            line.toLowerCase().includes("required") ||
            line.toLowerCase().includes("materials") ||
            line.toLowerCase().includes("book")) {
          materials.push(line.trim());
        }
      });
      
      // Extract policies
      const policies: string[] = [];
      lines.forEach(line => {
        if (line.toLowerCase().includes("policy") ||
            line.toLowerCase().includes("attendance") ||
            line.toLowerCase().includes("academic integrity") ||
            line.toLowerCase().includes("plagiarism") ||
            line.toLowerCase().includes("late work")) {
          policies.push(line.trim());
        }
      });
      
      const generatedNotes = {
        courseOverview: {
          title: courseTitle,
          instructor: instructor || "Not specified",
          officeHours: officeHours || "Not specified"
        },
        weeklyTopics: weeklyTopics.length > 0 ? weeklyTopics : [
          "Week 1: Introduction to Course Topics",
          "Week 2: Fundamental Concepts",
          "Week 3: Advanced Applications"
        ],
        grading: gradingInfo.length > 0 ? gradingInfo : [
          "Assignments: 30%",
          "Midterm: 30%", 
          "Final: 40%"
        ],
        importantDates: importantDates.length > 0 ? importantDates.map(item => 
          `${item.title}: ${item.date}`
        ) : [
          "Midterm: TBA",
          "Final: TBA"
        ],
        materials: materials.length > 0 ? materials : [
          "Required textbook: See course description",
          "Additional readings will be provided"
        ],
        policies: policies.length > 0 ? policies : [
          "Attendance policy: Regular attendance expected",
          "Late work policy: Contact instructor for extensions",
          "Academic honesty: Follow university guidelines"
        ]
      };
      
      setSmartNotes(generatedNotes);
      setIsGeneratingNotes(false);
      setShowSmartNotesPanel(true);
    }, 2000);
  };

  // Copy notes to clipboard
  const copyNotesToClipboard = () => {
    if (!smartNotes) return;
    
    const notesText = `
🧠 **Course Overview**
- ${smartNotes.courseOverview.title}
- Instructor: ${smartNotes.courseOverview.instructor}
- Office Hours: ${smartNotes.courseOverview.officeHours}

📅 **Weekly Topics**
${smartNotes.weeklyTopics.map(topic => `- ${topic}`).join('\n')}

📝 **Grading**
${smartNotes.grading.map(grade => `- ${grade}`).join('\n')}

📌 **Important Dates**
${smartNotes.importantDates.map(date => `- ${date}`).join('\n')}

📚 **Required Materials**
${smartNotes.materials.map(material => `- ${material}`).join('\n')}

📋 **Policies**
${smartNotes.policies.map(policy => `- ${policy}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(notesText).then(() => {
      alert("Notes copied to clipboard!");
    });
  };

  // Download notes as text file
  const downloadNotes = () => {
    if (!smartNotes) return;
    
    const notesText = `
Course Overview
===============
- ${smartNotes.courseOverview.title}
- Instructor: ${smartNotes.courseOverview.instructor}
- Office Hours: ${smartNotes.courseOverview.officeHours}

Weekly Topics
=============
${smartNotes.weeklyTopics.map(topic => `- ${topic}`).join('\n')}

Grading
=======
${smartNotes.grading.map(grade => `- ${grade}`).join('\n')}

Important Dates
===============
${smartNotes.importantDates.map(date => `- ${date}`).join('\n')}

Required Materials
==================
${smartNotes.materials.map(material => `- ${material}`).join('\n')}

Policies
========
${smartNotes.policies.map(policy => `- ${policy}`).join('\n')}
    `.trim();
    
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${smartNotes.courseOverview.title.replace(/[^a-z0-9]/gi, '_')}_smart_notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <BookOpen size={32} className="text-teal-500" />
          </div>
          <div>
            <h1 className="page-header">Syllabus Whisperer</h1>
            <p className="text-text-secondary">Transform any syllabus into a personalized learning path</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Upload Your Syllabus</h2>
        
        <div className="space-y-6">
          <textarea
            rows={8}
            className="input"
            placeholder="Paste your syllabus text here..."
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
          />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex-1 btn btn-secondary flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".txt,.md,.doc,.docx,.pdf"
                onChange={handleUpload}
                className="hidden"
              />
              <Upload size={18} />
              <span>Upload PDF</span>
            </label>
            <button 
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={processSyllabus}
              disabled={isProcessing || !syllabusText.trim()}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
                  <span>Processing ({processProgress}%)...</span>
                </>
              ) : (
                <>
                  <BookOpen size={18} />
                  <span>Process Syllabus</span>
                </>
              )}
            </button>
          </div>
          
          {isLoggedIn && courses.length > 0 && (
            <button 
              onClick={() => setShowSavedCoursesModal(true)}
              className="w-full p-3 border border-white/10 rounded-md bg-background text-white flex items-center justify-center gap-2 hover:bg-primary-light transition-colors"
            >
              <Folder size={18} />
              <span>Load Saved Course</span>
            </button>
          )}
        </div>
      </section>
      
      {isProcessed && (
        <>
          <section className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">{processedTitle}</h2>
              {isLoggedIn && (
                <button 
                  className="btn btn-secondary flex items-center gap-2 py-2"
                  onClick={saveCourse}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Course</span>
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap border-b border-white/10 mb-6">
              <button
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === "timeline" 
                    ? "border-white text-white" 
                    : "border-transparent text-text-secondary hover:text-white"
                }`}
                onClick={() => setActiveTab("timeline")}
              >
                <Calendar size={16} />
                <span>Timeline</span>
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === "notes" 
                    ? "border-white text-white" 
                    : "border-transparent text-text-secondary hover:text-white"
                }`}
                onClick={() => setActiveTab("notes")}
              >
                <FileText size={16} />
                <span>Smart Notes</span>
              </button>
            </div>
            
            {activeTab === "timeline" && (
              <div className="space-y-4">
                {processedItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      item.isCompleted 
                        ? "bg-background border-white/10 text-text-secondary" 
                        : item.isDue 
                          ? "bg-background border-white/20" 
                          : "bg-background border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button 
                        className={`mt-0.5 p-1 rounded-full ${
                          item.isCompleted ? "bg-background text-text-secondary border border-white/10" : "bg-white text-black"
                        }`}
                        onClick={() => toggleTaskComplete(item.id)}
                      >
                        <CheckCircle size={16} />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-medium ${item.isCompleted ? "text-text-secondary line-through" : "text-white"}`}>
                              {item.title}
                            </h3>
                            <p className="text-xs text-text-secondary mt-1">
                              {item.date}
                            </p>
                          </div>
                          {item.isDue && !item.isCompleted && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-background border border-white/20 text-white flex items-center gap-1">
                              <Clock size={12} /> 
                              <span>Due Soon</span>
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-text-secondary mt-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === "notes" && (
              <div className="space-y-6">
                {!smartNotes ? (
                  <div className="p-6 bg-background rounded-lg border border-white/10 text-center">
                    <Brain size={36} className="text-teal-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Smart Notes Feature</h3>
                    <p className="text-text-secondary mb-4 max-w-md mx-auto">
                      We'll automatically extract key concepts and generate study notes for your course.
                    </p>
                    <button 
                      className="btn btn-primary flex items-center gap-2 mx-auto"
                      onClick={generateSmartNotes}
                      disabled={isGeneratingNotes || !syllabusText.trim()}
                    >
                      {isGeneratingNotes ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Brain size={18} />
                          <span>Generate Smart Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Notes Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Brain className="text-teal-500" size={24} />
                        Smart Notes
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={copyNotesToClipboard}
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Copy size={16} />
                          Copy
                        </button>
                        <button 
                          onClick={downloadNotes}
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                        <button 
                          onClick={() => setSmartNotes(null)}
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Brain size={16} />
                          Regenerate
                        </button>
                      </div>
                    </div>

                    {/* Course Overview */}
                    <div className="p-4 bg-background rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        🧠 <span>Course Overview</span>
                      </h4>
                      <ul className="space-y-2 text-text-secondary">
                        <li>• {smartNotes.courseOverview.title}</li>
                        <li>• Instructor: {smartNotes.courseOverview.instructor}</li>
                        <li>• Office Hours: {smartNotes.courseOverview.officeHours}</li>
                      </ul>
                    </div>

                    {/* Weekly Topics */}
                    <div className="p-4 bg-background rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        📅 <span>Weekly Topics</span>
                      </h4>
                      <ul className="space-y-2 text-text-secondary">
                        {smartNotes.weeklyTopics.map((topic, index) => (
                          <li key={index}>• {topic}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Grading */}
                    <div className="p-4 bg-background rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        📝 <span>Grading</span>
                      </h4>
                      <ul className="space-y-2 text-text-secondary">
                        {smartNotes.grading.map((grade, index) => (
                          <li key={index}>• {grade}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Important Dates */}
                    <div className="p-4 bg-background rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        📌 <span>Important Dates</span>
                      </h4>
                      <ul className="space-y-2 text-text-secondary">
                        {smartNotes.importantDates.map((date, index) => (
                          <li key={index}>• {date}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Required Materials */}
                    <div className="p-4 bg-background rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        📚 <span>Required Materials</span>
                      </h4>
                      <ul className="space-y-2 text-text-secondary">
                        {smartNotes.materials.map((material, index) => (
                          <li key={index}>• {material}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Policies */}
                    <div className="p-4 bg-background rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        📋 <span>Policies</span>
                      </h4>
                      <ul className="space-y-2 text-text-secondary">
                        {smartNotes.policies.map((policy, index) => (
                          <li key={index}>• {policy}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
      
      {/* Saved Courses Modal */}
      {showSavedCoursesModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary rounded-lg w-full max-w-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Your Saved Courses</h3>
              <button 
                className="p-1 rounded-full hover:bg-primary-light text-text-secondary"
                onClick={() => setShowSavedCoursesModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {courses.map((course) => (
                <button
                  key={course.id}
                  className="w-full p-4 rounded-lg bg-background hover:bg-primary-light transition-colors text-left border border-white/10 flex items-start gap-3"
                  onClick={() => loadCourse(course)}
                >
                  <Archive className="text-teal-500" size={20} />
                  <div>
                    <h4 className="font-medium text-white">{course.title}</h4>
                    <p className="text-xs text-text-secondary mt-1">
                      {course.timeline.length} items • {course.timeline.filter(item => item.isCompleted).length} completed
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sample timeline items for demo purposes
const timelineItems = [
  {
    title: "Assignment 1: Consumer Choice Problem Set",
    date: "Sept 19",
    description: "Complete problems 1-10 from Chapter 3",
    isCompleted: false,
    isDue: true
  },
  {
    title: "Midterm Exam",
    date: "Oct 10",
    description: "Covers Weeks 1-5, bring calculator and pencils",
    isCompleted: false,
    isDue: false
  },
  {
    title: "Assignment 2: Production Functions Analysis",
    date: "Oct 31",
    description: "Group project with presentation component",
    isCompleted: false,
    isDue: false
  },
  {
    title: "Final Project Presentations",
    date: "Nov 28",
    description: "15-minute presentation plus 5-minute Q&A",
    isCompleted: false,
    isDue: false
  },
  {
    title: "Final Exam",
    date: "Dec 12",
    description: "Comprehensive exam covering all course material",
    isCompleted: false,
    isDue: false
  }
]; 