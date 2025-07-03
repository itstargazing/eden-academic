import { useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface FlowchartProps {
  text: string;
}

interface ProcessStep {
  id: string;
  text: string;
  order: number;
}

const parseProcessSteps = (text: string): ProcessStep[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const steps: ProcessStep[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Check for numbered steps
    const numberedMatch = trimmedLine.match(/^(\d+)[.)]?\s+(.+)/);
    if (numberedMatch) {
      steps.push({
        id: `step-${index}`,
        text: numberedMatch[2],
        order: parseInt(numberedMatch[1])
      });
      return;
    }
    
    // Check for step keywords
    const stepKeywords = /^(step|first|second|third|next|then|finally|lastly)[:.]\s+(.+)/i;
    const keywordMatch = trimmedLine.match(stepKeywords);
    if (keywordMatch) {
      steps.push({
        id: `step-${index}`,
        text: keywordMatch[2],
        order: steps.length + 1
      });
      return;
    }
    
    // If line starts with an action verb, treat it as a step
    const actionVerbs = /^(analyze|create|develop|establish|identify|implement|improve|increase|maintain|perform|prepare|provide|reduce|verify|begin|start|end|complete)/i;
    if (actionVerbs.test(trimmedLine)) {
      steps.push({
        id: `step-${index}`,
        text: trimmedLine,
        order: steps.length + 1
      });
    }
  });
  
  return steps.sort((a, b) => a.order - b.order);
};

const createNodesAndEdges = (steps: ProcessStep[], direction: 'horizontal' | 'vertical' = 'vertical') => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const spacing = direction === 'vertical' ? { x: 0, y: 120 } : { x: 250, y: 0 };
  const startPosition = { x: 400, y: 50 };
  
  steps.forEach((step, index) => {
    // Create node
    nodes.push({
      id: step.id,
      position: {
        x: startPosition.x + (spacing.x * index),
        y: startPosition.y + (spacing.y * index)
      },
      data: { label: step.text },
      type: 'default',
      style: {
        background: '#1e40af', // dark blue
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        width: 160,
        textAlign: 'center',
      },
    });
    
    // Create edge to next step
    if (index < steps.length - 1) {
      edges.push({
        id: `edge-${step.id}-${steps[index + 1].id}`,
        source: step.id,
        target: steps[index + 1].id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 2 },
      });
    }
  });
  
  return { nodes, edges };
};

export default function Flowchart({ text }: FlowchartProps) {
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('vertical');
  const steps = parseProcessSteps(text);
  const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(steps, direction);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const toggleDirection = () => {
    const newDirection = direction === 'vertical' ? 'horizontal' : 'vertical';
    setDirection(newDirection);
    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(steps, newDirection);
    setNodes(newNodes);
    setEdges(newEdges);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Process Flowchart</h3>
        <button
          onClick={toggleDirection}
          className="btn btn-secondary"
        >
          Toggle {direction === 'vertical' ? 'Horizontal' : 'Vertical'} Layout
        </button>
      </div>
      
      <div style={{ width: '100%', height: '600px' }} className="bg-background rounded-lg border border-white/10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            nodeColor={(node) => {
              return '#1e40af';
            }}
          />
        </ReactFlow>
      </div>
      
      <div className="mt-4 p-4 bg-primary rounded-lg">
        <p className="text-sm text-text-secondary">
          <strong>Tips:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Drag nodes to rearrange them</li>
            <li>Use mouse wheel to zoom in/out</li>
            <li>Hold right mouse button to pan</li>
            <li>Toggle layout direction for better fit</li>
          </ul>
        </p>
      </div>
    </div>
  );
} 