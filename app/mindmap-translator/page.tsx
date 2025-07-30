"use client";

import { useState } from "react";
import { Map, Upload, Share2, Sparkles, FileText, Lightbulb, BookOpen, FlaskConical } from "lucide-react";
import MindMap from "@/components/mindmap-translator/MindMap";
import Flashcards from "@/components/mindmap-translator/Flashcards";
import SimplifiedNotes from "@/components/mindmap-translator/SimplifiedNotes";
import Flowchart from "@/components/mindmap-translator/Flowchart";

export default function MindMapTranslatorPage() {
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("mindmap");
  const [transformedContent, setTransformedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result;
      if (content && typeof content === 'string') {
        setNotes(content);
      }
    };
    reader.readAsText(file);
  };

  const transformNotes = async () => {
    if (!notes.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process the notes based on their structure
      const processedNotes = notes.split('\n')
        .filter(line => line.trim())
        .map(line => {
          // Add basic indentation detection
          const match = line.match(/^\s*/);
          const indentation = match ? match[0].length : 0;
          return '  '.repeat(Math.floor(indentation / 2)) + line.trim();
        })
        .join('\n');
      
      setTransformedContent(processedNotes);
    } catch (error) {
      console.error('Error transforming notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (!transformedContent) {
      return (
        <div className="text-center">
          <Lightbulb size={48} className="text-accent mx-auto mb-4 opacity-40" />
          <p className="text-text-secondary">Enter your notes and click "Transform Notes" to see the results</p>
        </div>
      );
    }

    switch (activeTab) {
      case "mindmap":
        return <MindMap text={transformedContent} />;
      case "flashcards":
        return <Flashcards text={transformedContent} />;
      case "simplified":
        return <SimplifiedNotes text={transformedContent} />;
      case "flowchart":
        return <Flowchart text={transformedContent} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 feature-page">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <Map size={32} className="text-blue-500" />
          </div>
          <div>
            <h1 className="page-header">MindMap Translator</h1>
            <p className="text-text-secondary">Transform lecture notes into personalized study maps</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Upload Your Notes</h2>
        
        <div className="space-y-6">
          <textarea
            rows={8}
            className="w-full p-4 border border-primary-light rounded-md bg-background-light text-text-primary focus:ring-accent focus:border-accent"
            placeholder="Paste your lecture notes, syllabus or study content here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="btn btn-secondary flex-1 flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".txt,.md,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload size={18} />
              <span>Upload File</span>
            </label>
            <button 
              onClick={transformNotes}
              disabled={!notes.trim() || isLoading}
              className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Transforming...' : 'Transform Notes'}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Personalized Study Formats</h2>
        
        <div className="flex flex-wrap border-b border-primary-light mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
        
        <div className="bg-primary-light rounded-lg p-6 min-h-[300px] flex items-center justify-center">
          {renderContent()}
        </div>
      </section>
    </div>
  );
}

const tabs = [
  { id: "mindmap", name: "Mind Map", icon: Map },
  { id: "flashcards", name: "Flashcards", icon: BookOpen },
  { id: "simplified", name: "Simplified", icon: FileText },
  { id: "flowchart", name: "Flowchart", icon: FlaskConical },
]; 