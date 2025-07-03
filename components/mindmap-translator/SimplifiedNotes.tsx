import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SimplifiedNotesProps {
  text: string;
}

const simplifyText = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim());
  const simplified: string[] = [];
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Replace complex terms with simpler alternatives
    let simplifiedLine = trimmedLine
      .replace(/utilize/g, 'use')
      .replace(/implement/g, 'use')
      .replace(/facilitate/g, 'help')
      .replace(/demonstrate/g, 'show')
      .replace(/subsequently/g, 'then')
      .replace(/prior to/g, 'before')
      .replace(/commence/g, 'start')
      .replace(/terminate/g, 'end')
      .replace(/sufficient/g, 'enough')
      .replace(/numerous/g, 'many')
      .replace(/optimal/g, 'best')
      .replace(/initiate/g, 'start')
      .replace(/utilize/g, 'use')
      .replace(/comprehend/g, 'understand')
      .replace(/ascertain/g, 'find out')
      .replace(/endeavor/g, 'try')
      .replace(/fundamental/g, 'basic')
      .replace(/methodology/g, 'method')
      .replace(/paradigm/g, 'model')
      .replace(/conceptualize/g, 'think about')
      .replace(/consequently/g, 'so')
      .replace(/subsequently/g, 'then')
      .replace(/additionally/g, 'also')
      .replace(/furthermore/g, 'also')
      .replace(/moreover/g, 'also')
      .replace(/therefore/g, 'so')
      .replace(/thus/g, 'so')
      .replace(/hence/g, 'so')
      .replace(/accordingly/g, 'so')
      .replace(/consequently/g, 'so');
    
    // Break long sentences into shorter ones
    const sentences = simplifiedLine.split(/[.!?]+/).filter(s => s.trim());
    sentences.forEach(sentence => {
      const words = sentence.trim().split(' ');
      
      // If sentence is too long, break it into chunks
      if (words.length > 15) {
        for (let i = 0; i < words.length; i += 15) {
          const chunk = words.slice(i, i + 15).join(' ');
          simplified.push(chunk + '.');
        }
      } else {
        simplified.push(sentence + '.');
      }
    });
    
    // Add explanatory phrases for complex concepts
    if (trimmedLine.includes('hypothesis')) {
      simplified.push('(A hypothesis is just an educated guess that scientists test to see if it\'s true.)');
    }
    if (trimmedLine.includes('theory')) {
      simplified.push('(A theory is like a well-tested explanation for how something works in nature.)');
    }
    if (trimmedLine.includes('correlation')) {
      simplified.push('(When two things are correlated, it means they tend to happen together or are related.)');
    }
    
    // Add bullet points for clarity
    simplified.push('');
  });
  
  return simplified.join('\n');
};

export default function SimplifiedNotes({ text }: SimplifiedNotesProps) {
  const [copied, setCopied] = useState(false);
  const simplifiedText = simplifyText(text);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(simplifiedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Simplified Explanation</h3>
        <button
          onClick={copyToClipboard}
          className="btn btn-secondary flex items-center gap-2 text-xs"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      <div className="bg-primary p-4 rounded-lg border border-white/10">
        <div className="prose prose-invert max-w-none">
          {simplifiedText.split('\n').map((line, index) => (
            line.trim() ? (
              <p key={index} className="mb-3 text-sm text-white leading-relaxed">
                {line.startsWith('(') ? (
                  <span className="text-xs text-green-400 italic">{line}</span>
                ) : line}
              </p>
            ) : null
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <p className="text-xs text-green-400">
          This simplified version:
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
            <li>Uses simpler words and shorter sentences</li>
            <li>Adds helpful explanations for complex terms</li>
            <li>Breaks down information into easier chunks</li>
            <li>Keeps the main ideas while making them clearer</li>
          </ul>
        </p>
      </div>
    </div>
  );
} 