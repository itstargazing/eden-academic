import { useState, useEffect } from 'react';
import { Copy, Check, BarChart3, Lightbulb, Target } from 'lucide-react';
import { TextProcessor, SimplifiedContent } from '@/lib/text-processing';

interface SimplifiedNotesProps {
  text: string;
}

export default function SimplifiedNotes({ text }: SimplifiedNotesProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [simplifiedContent, setSimplifiedContent] = useState<SimplifiedContent | null>(null);
  
  // Process text when it changes
  useEffect(() => {
    const processText = async () => {
      if (!text.trim()) {
        setSimplifiedContent(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = TextProcessor.simplifyText(text);
      setSimplifiedContent(result);
      setIsLoading(false);
    };
    
    processText();
  }, [text]);
  
  const copyToClipboard = () => {
    if (simplifiedContent) {
      navigator.clipboard.writeText(simplifiedContent.simplifiedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const getReadabilityColor = (score: number) => {
    if (score >= 70) return 'text-[var(--text)]';
    if (score >= 50) return 'text-[var(--text)]';
    return 'text-[var(--text)]';
  };
  
  const getReadabilityLabel = (score: number) => {
    if (score >= 80) return 'Very Easy';
    if (score >= 70) return 'Easy';
    if (score >= 60) return 'Fairly Easy';
    if (score >= 50) return 'Standard';
    if (score >= 40) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--text)] border-t-transparent rounded-full mb-4"></div>
        <p className="text-text-secondary">Simplifying your notes...</p>
        <p className="text-xs text-text-secondary mt-2">Analyzing readability and improving clarity</p>
      </div>
    );
  }
  
  if (!simplifiedContent) {
    return (
      <div className="text-center text-text-secondary p-8">
        <Lightbulb size={48} className="mx-auto mb-4 opacity-40" />
        <h3 className="text-lg font-medium text-[var(--text)] mb-2">No content to simplify</h3>
        <p>Enter some text to see a simplified version with improved readability.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background p-4 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-[var(--text)]" />
            <span className="text-sm font-medium text-[var(--text)]">Readability Score</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${getReadabilityColor(simplifiedContent.readabilityScore)}`}>
              {Math.round(simplifiedContent.readabilityScore)}
            </span>
            <span className="text-sm text-text-secondary">
              {getReadabilityLabel(simplifiedContent.readabilityScore)}
            </span>
          </div>
        </div>
        
        <div className="bg-background p-4 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-[var(--text)]" />
            <span className="text-sm font-medium text-[var(--text)]">Length Reduction</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--text)]">
              {Math.round(((simplifiedContent.originalLength - simplifiedContent.simplifiedLength) / simplifiedContent.originalLength) * 100)}%
            </span>
            <span className="text-sm text-text-secondary">shorter</span>
          </div>
        </div>
        
        <div className="bg-background p-4 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-[var(--text)]" />
            <span className="text-sm font-medium text-[var(--text)]">Key Points</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--text)]">
              {simplifiedContent.keyPoints.length}
            </span>
            <span className="text-sm text-text-secondary">identified</span>
          </div>
        </div>
      </div>
      
      {/* Simplified Content */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[var(--text)]">Simplified Content</h3>
          <button
            onClick={copyToClipboard}
            className="btn btn-secondary flex items-center gap-2 text-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="bg-primary p-6 rounded-lg border border-[var(--border)]">
          <div className="prose prose-invert max-w-none">
            {simplifiedContent.simplifiedText.split('\n\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="mb-4 text-sm text-[var(--text)] leading-relaxed">
                  {paragraph.startsWith('(') && paragraph.endsWith(')') ? (
                    <span className="text-xs text-[var(--text)] italic bg-[var(--bg-hover)] px-2 py-1 rounded">
                      {paragraph}
                    </span>
                  ) : (
                    paragraph
                  )}
                </p>
              ) : null
            ))}
          </div>
        </div>
      </div>
      
      {/* Key Points */}
      {simplifiedContent.keyPoints.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-[var(--text)] flex items-center gap-2">
            <Target size={16} className="text-[var(--text)]" />
            Key Points Identified
          </h4>
          <div className="space-y-2">
            {simplifiedContent.keyPoints.map((point, index) => (
              <div key={index} className="p-3 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg">
                <p className="text-sm text-[var(--text)]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Improvements Made */}
      {simplifiedContent.improvements.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-[var(--text)] flex items-center gap-2">
            <Check size={16} className="text-[var(--text)]" />
            Improvements Made
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {simplifiedContent.improvements.map((improvement, index) => (
              <div key={index} className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded text-xs text-[var(--text)]">
                {improvement}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tips */}
      <div className="p-4 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg">
        <h4 className="text-sm font-medium text-[var(--text)] mb-2">How this helps your learning:</h4>
        <ul className="text-xs text-[var(--text-dim)] space-y-1">
          <li>• Uses simpler words and shorter sentences for better comprehension</li>
          <li>• Breaks down complex concepts into digestible chunks</li>
          <li>• Adds explanations for technical terms</li>
          <li>• Highlights key information for focus</li>
          <li>• Improves readability score for easier studying</li>
        </ul>
      </div>
    </div>
  );
} 