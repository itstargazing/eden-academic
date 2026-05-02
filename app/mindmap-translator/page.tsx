"use client";
// npm install mammoth

import { useRef, useState } from "react";
import { Map, Upload, Share2, Sparkles, FileText, Lightbulb, BookOpen, FlaskConical } from "lucide-react";
import GalaxyAnimation from "@/components/GalaxyAnimation";
import { loadPdfJsForBrowser } from "@/lib/pdfjs-browser";
import MindMap from "@/components/mindmap-translator/MindMap";
import Flashcards from "@/components/mindmap-translator/Flashcards";
import SimplifiedNotes from "@/components/mindmap-translator/SimplifiedNotes";
import Flowchart from "@/components/mindmap-translator/Flowchart";

export default function MindMapTranslatorPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("mindmap");
  const [transformedContent, setTransformedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState("");

  async function extractFileText(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension === 'txt' || extension === 'md') {
      return await file.text()
    }

    if (extension === 'pdf') {
      if (typeof window === 'undefined') {
        throw new Error('PDF reading is only available in the browser.')
      }
      const pdfjsLib = await loadPdfJsForBrowser()
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      const pages: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const text = content.items
          .filter((item: any) => 'str' in item)
          .map((item: any) => item.str)
          .join(' ')
        pages.push(text)
      }
      const result = pages.join('\n\n')
      if (!result.trim()) throw new Error('PDF appears to be scanned/image-based. Use a text PDF.')
      return result
    }

    if (extension === 'docx' || extension === 'doc') {
      if (typeof window === 'undefined') {
        throw new Error('Word document reading is only available in the browser.')
      }
      // @ts-expect-error Mammoth's browser bundle does not ship typed subpath exports.
      const mammothModule = await import('mammoth/mammoth.browser')
      const mammoth = (mammothModule as { default?: typeof mammothModule }).default ?? mammothModule
      if (!mammoth || typeof (mammoth as { extractRawText?: unknown }).extractRawText !== 'function') {
        throw new Error('Could not load the document reader. Try a PDF or TXT file.')
      }
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      if (!result.value.trim()) throw new Error('Could not extract text from this Word file.')
      return result.value
    }

    throw new Error('Unsupported file type. Use PDF, TXT, DOCX, or MD.')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setError('')
    try {
      setExtracting(true)
      const text = await extractFileText(file)
      setExtractedText(text)
      setNotes(text)
    } catch (err: any) {
      setError(err.message || 'Failed to read file.')
    } finally {
      setExtracting(false)
    }
  }

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
          <Lightbulb size={48} className="text-[var(--text-dim)] mx-auto mb-4 opacity-40" />
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
    <div className="split-layout min-h-screen w-full max-w-full">
      <div className="split-left flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-panel)] p-6 sm:p-10">
        <GalaxyAnimation label="MindMap Translator" />
      </div>
      <div className="split-right flex min-h-0 w-full max-w-full min-w-0 flex-col gap-6 bg-[var(--bg)] p-6 sm:p-8 xl:overflow-y-auto">
    <div className="feature-page min-w-0 max-w-full space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-[var(--border)] rounded-lg">
            <Map size={32} className="text-[var(--text)]" />
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
              className="w-full min-w-0 max-w-full box-border resize-y break-words p-4 border border-primary-light rounded-md bg-background-light text-text-primary focus:ring-accent focus:border-accent"
            placeholder="Paste your lecture notes, syllabus or study content here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="btn btn-secondary flex-1 flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.txt,.docx,.doc,.md"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
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
          {fileName ? <p className="text-sm text-text-secondary">{fileName}</p> : null}
          {extracting && (
            <p style={{ color: '#444', fontSize: '0.85rem' }}>Reading file...</p>
          )}
          {error && (
            <p style={{ color: '#cc0000', fontSize: '0.85rem' }}>{error}</p>
          )}
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
                  ? "border-[var(--text)] text-[var(--text)]"
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
      </div>
    </div>
  );
}

const tabs = [
  { id: "mindmap", name: "Mind Map", icon: Map },
  { id: "flashcards", name: "Flashcards", icon: BookOpen },
  { id: "simplified", name: "Simplified", icon: FileText },
  { id: "flowchart", name: "Flowchart", icon: FlaskConical },
]; 