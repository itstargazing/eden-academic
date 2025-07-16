// Production-ready text processing service for MindMap Translator

export interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SimplifiedContent {
  originalLength: number;
  simplifiedLength: number;
  readabilityScore: number;
  keyPoints: string[];
  simplifiedText: string;
  improvements: string[];
}

export interface FlowchartNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  position: { x: number; y: number };
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export class TextProcessor {
  // Enhanced flashcard generation with better concept extraction
  static generateFlashcards(text: string): FlashcardData[] {
    const cards: FlashcardData[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    // Pattern matching for different types of content
    const patterns = {
      definition: /^(.+?)\s*[-:]\s*(.+)$/,
      concept: /^(.+?)\s+(is|are|means?|refers? to)\s+(.+)$/i,
      process: /^(step \d+|first|second|third|next|then|finally)[:\s]+(.+)$/i,
      fact: /^(.+?)\s+(was|were|has|have|will|can|should|must)\s+(.+)$/i,
      question: /^(.+\?)\s*(.+)$/,
      numbered: /^(\d+)\.\s*(.+)$/,
      bullet: /^[-*•]\s*(.+)$/
    };
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.length < 10) return;
      
      // Definition pattern (term - definition)
      const defMatch = trimmedLine.match(patterns.definition);
      if (defMatch) {
        const [, term, definition] = defMatch;
        cards.push({
          id: `card-${index}`,
          question: `What is ${term.trim()}?`,
          answer: definition.trim(),
          concept: term.trim(),
          difficulty: definition.length > 100 ? 'hard' : definition.length > 50 ? 'medium' : 'easy'
        });
        return;
      }
      
      // Concept explanation pattern
      const conceptMatch = trimmedLine.match(patterns.concept);
      if (conceptMatch) {
        const [, subject, verb, explanation] = conceptMatch;
        cards.push({
          id: `card-${index}`,
          question: `What ${verb} ${subject.trim()}?`,
          answer: explanation.trim(),
          concept: subject.trim(),
          difficulty: explanation.length > 100 ? 'hard' : explanation.length > 50 ? 'medium' : 'easy'
        });
        return;
      }
      
      // Process step pattern
      const processMatch = trimmedLine.match(patterns.process);
      if (processMatch) {
        const [, stepIndicator, content] = processMatch;
        cards.push({
          id: `card-${index}`,
          question: `What happens in ${stepIndicator.toLowerCase()}?`,
          answer: content.trim(),
          concept: 'Process Step',
          difficulty: 'medium'
        });
        return;
      }
      
      // Fact pattern
      const factMatch = trimmedLine.match(patterns.fact);
      if (factMatch) {
        const [, subject, verb, predicate] = factMatch;
        cards.push({
          id: `card-${index}`,
          question: `What ${verb} ${subject.trim()}?`,
          answer: predicate.trim(),
          concept: subject.trim(),
          difficulty: 'medium'
        });
        return;
      }
      
      // For other content, create comprehension questions
      if (trimmedLine.length > 20) {
        const words = trimmedLine.split(' ');
        const concept = words.slice(0, 3).join(' ');
        
        cards.push({
          id: `card-${index}`,
          question: `Explain: ${concept}...`,
          answer: trimmedLine,
          concept: concept,
          difficulty: trimmedLine.length > 150 ? 'hard' : 'medium'
        });
      }
    });
    
    return cards;
  }
  
  // Advanced text simplification with readability analysis
  static simplifyText(text: string): SimplifiedContent {
    const lines = text.split('\n').filter(line => line.trim());
    const originalLength = text.length;
    
    // Complex word replacements
    const complexWords: Record<string, string> = {
      'utilize': 'use',
      'implement': 'use',
      'facilitate': 'help',
      'demonstrate': 'show',
      'subsequently': 'then',
      'prior to': 'before',
      'commence': 'start',
      'terminate': 'end',
      'sufficient': 'enough',
      'numerous': 'many',
      'optimal': 'best',
      'initiate': 'start',
      'comprehend': 'understand',
      'ascertain': 'find out',
      'endeavor': 'try',
      'fundamental': 'basic',
      'methodology': 'method',
      'paradigm': 'model',
      'conceptualize': 'think about',
      'consequently': 'so',
      'additionally': 'also',
      'furthermore': 'also',
      'moreover': 'also',
      'therefore': 'so',
      'thus': 'so',
      'hence': 'so',
      'accordingly': 'so',
      'substantial': 'large',
      'significant': 'important',
      'approximately': 'about',
      'indicate': 'show',
      'establish': 'set up',
      'acquire': 'get',
      'construct': 'build',
      'eliminate': 'remove',
      'emphasize': 'stress',
      'examine': 'look at',
      'generate': 'create',
      'investigate': 'study',
      'maintain': 'keep',
      'modify': 'change',
      'participate': 'take part',
      'purchase': 'buy',
      'require': 'need',
      'respond': 'answer',
      'select': 'choose',
      'transform': 'change'
    };
    
    const simplifiedLines: string[] = [];
    const keyPoints: string[] = [];
    const improvements: string[] = [];
    
    lines.forEach(line => {
      let simplifiedLine = line.trim();
      
      // Replace complex words
      Object.entries(complexWords).forEach(([complex, simple]) => {
        const regex = new RegExp(`\\b${complex}\\b`, 'gi');
        if (regex.test(simplifiedLine)) {
          simplifiedLine = simplifiedLine.replace(regex, simple);
          improvements.push(`Replaced "${complex}" with "${simple}"`);
        }
      });
      
      // Break long sentences
      const sentences = simplifiedLine.split(/[.!?]+/).filter(s => s.trim());
      sentences.forEach(sentence => {
        const words = sentence.trim().split(' ');
        
        if (words.length > 20) {
          // Split into smaller chunks
          for (let i = 0; i < words.length; i += 15) {
            const chunk = words.slice(i, i + 15).join(' ');
            if (chunk.trim()) {
              simplifiedLines.push(chunk.trim() + '.');
            }
          }
          improvements.push('Broke down long sentence into smaller parts');
        } else if (words.length > 5) {
          simplifiedLines.push(sentence.trim() + '.');
        }
      });
      
      // Extract key points
      if (line.includes('important') || line.includes('key') || line.includes('main') || line.includes('significant')) {
        keyPoints.push(line.trim());
      }
    });
    
    // Add explanations for technical terms
    const technicalTerms: Record<string, string> = {
      'hypothesis': 'An educated guess that scientists test',
      'theory': 'A well-tested explanation for how something works',
      'correlation': 'When two things tend to happen together',
      'algorithm': 'A set of steps to solve a problem',
      'data': 'Information or facts',
      'analysis': 'Careful study of something',
      'synthesis': 'Combining different ideas',
      'methodology': 'The way something is done',
      'variable': 'Something that can change',
      'control': 'Something kept the same in an experiment'
    };
    
    Object.entries(technicalTerms).forEach(([term, explanation]) => {
      if (text.toLowerCase().includes(term)) {
        simplifiedLines.push(`(${term.charAt(0).toUpperCase() + term.slice(1)} means: ${explanation})`);
        improvements.push(`Added explanation for "${term}"`);
      }
    });
    
    const simplifiedText = simplifiedLines.join('\n\n');
    const simplifiedLength = simplifiedText.length;
    
    // Calculate readability score (simplified Flesch Reading Ease)
    const avgSentenceLength = simplifiedLines.length > 0 ? simplifiedText.split(' ').length / simplifiedLines.length : 0;
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgSentenceLength)));
    
    return {
      originalLength,
      simplifiedLength,
      readabilityScore,
      keyPoints,
      simplifiedText,
      improvements: [...new Set(improvements)] // Remove duplicates
    };
  }
  
  // Enhanced flowchart generation with better node detection
  static generateFlowchart(text: string): { nodes: FlowchartNode[]; edges: FlowchartEdge[] } {
    const lines = text.split('\n').filter(line => line.trim());
    const nodes: FlowchartNode[] = [];
    const edges: FlowchartEdge[] = [];
    
    // Process detection patterns
    const patterns = {
      numbered: /^(\d+)\.\s*(.+)$/,
      step: /^(step \d+|first|second|third|next|then|finally|lastly)[:\s]+(.+)$/i,
      action: /^(analyze|create|develop|establish|identify|implement|improve|increase|maintain|perform|prepare|provide|reduce|verify|begin|start|end|complete|calculate|determine|evaluate|execute|process|review|update|validate)\s+(.+)$/i,
      decision: /^(if|when|whether|decide|choose|select|check|test|verify|confirm)\s+(.+)$/i,
      condition: /^(unless|until|while|during|after|before)\s+(.+)$/i
    };
    
    let nodeIndex = 0;
    const spacing = { x: 250, y: 120 };
    const startPos = { x: 100, y: 50 };
    
    // Add start node
    nodes.push({
      id: 'start',
      label: 'Start',
      type: 'start',
      position: { x: startPos.x, y: startPos.y }
    });
    
    let lastNodeId = 'start';
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.length < 5) return;
      
      let nodeType: 'process' | 'decision' = 'process';
      let nodeLabel = trimmedLine;
      
      // Check for numbered steps
      const numberedMatch = trimmedLine.match(patterns.numbered);
      if (numberedMatch) {
        nodeLabel = numberedMatch[2];
      }
      
      // Check for step indicators
      const stepMatch = trimmedLine.match(patterns.step);
      if (stepMatch) {
        nodeLabel = stepMatch[2];
      }
      
      // Check for action verbs
      const actionMatch = trimmedLine.match(patterns.action);
      if (actionMatch) {
        nodeLabel = `${actionMatch[1].charAt(0).toUpperCase() + actionMatch[1].slice(1)} ${actionMatch[2]}`;
      }
      
      // Check for decision points
      const decisionMatch = trimmedLine.match(patterns.decision);
      if (decisionMatch) {
        nodeType = 'decision';
        nodeLabel = `${decisionMatch[1].charAt(0).toUpperCase() + decisionMatch[1].slice(1)} ${decisionMatch[2]}?`;
      }
      
      // Limit label length
      if (nodeLabel.length > 50) {
        nodeLabel = nodeLabel.substring(0, 47) + '...';
      }
      
      const nodeId = `node-${nodeIndex}`;
      nodeIndex++;
      
      // Calculate position
      const row = Math.floor(nodeIndex / 3);
      const col = nodeIndex % 3;
      
      nodes.push({
        id: nodeId,
        label: nodeLabel,
        type: nodeType,
        position: {
          x: startPos.x + (col * spacing.x),
          y: startPos.y + ((row + 1) * spacing.y)
        }
      });
      
      // Create edge from previous node
      edges.push({
        id: `edge-${lastNodeId}-${nodeId}`,
        source: lastNodeId,
        target: nodeId,
        label: nodeType === 'decision' ? 'Yes' : undefined
      });
      
      lastNodeId = nodeId;
    });
    
    // Add end node
    if (nodes.length > 1) {
      const endNodeId = 'end';
      const lastProcessNode = nodes[nodes.length - 1];
      
      nodes.push({
        id: endNodeId,
        label: 'End',
        type: 'end',
        position: {
          x: lastProcessNode.position.x,
          y: lastProcessNode.position.y + spacing.y
        }
      });
      
      edges.push({
        id: `edge-${lastNodeId}-${endNodeId}`,
        source: lastNodeId,
        target: endNodeId
      });
    }
    
    return { nodes, edges };
  }
  
  // Extract key concepts for mind mapping
  static extractConcepts(text: string): { main: string[]; supporting: string[]; connections: Array<{from: string; to: string; relationship: string}> } {
    const lines = text.split('\n').filter(line => line.trim());
    const main: string[] = [];
    const supporting: string[] = [];
    const connections: Array<{from: string; to: string; relationship: string}> = [];
    
    // Common academic indicators
    const mainIndicators = ['main', 'primary', 'key', 'important', 'central', 'core', 'fundamental', 'essential'];
    const supportingIndicators = ['example', 'instance', 'such as', 'including', 'like', 'for example', 'e.g.'];
    const relationshipIndicators = ['because', 'therefore', 'thus', 'hence', 'leads to', 'results in', 'causes', 'due to'];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Check for main concepts
      if (mainIndicators.some(indicator => lowerLine.includes(indicator))) {
        const concept = this.extractConceptFromLine(line);
        if (concept && !main.includes(concept)) {
          main.push(concept);
        }
      }
      
      // Check for supporting concepts
      if (supportingIndicators.some(indicator => lowerLine.includes(indicator))) {
        const concept = this.extractConceptFromLine(line);
        if (concept && !supporting.includes(concept)) {
          supporting.push(concept);
        }
      }
      
      // Check for relationships
      relationshipIndicators.forEach(indicator => {
        if (lowerLine.includes(indicator)) {
          const parts = line.split(new RegExp(indicator, 'i'));
          if (parts.length === 2) {
            const from = this.extractConceptFromLine(parts[0].trim());
            const to = this.extractConceptFromLine(parts[1].trim());
            if (from && to) {
              connections.push({ from, to, relationship: indicator });
            }
          }
        }
      });
    });
    
    return { main, supporting, connections };
  }
  
  private static extractConceptFromLine(line: string): string | null {
    const cleaned = line.trim().replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
    if (cleaned.length < 3 || cleaned.length > 100) return null;
    
    // Extract the first meaningful phrase (up to first punctuation or 8 words)
    const words = cleaned.split(' ');
    const concept = words.slice(0, Math.min(8, words.length)).join(' ');
    
    return concept.replace(/[.!?:;,]$/, '').trim();
  }
} 