import { useState, useEffect } from 'react';
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
import { TextProcessor, FlowchartNode as ProcessedNode, FlowchartEdge as ProcessedEdge } from '@/lib/text-processing';
import { RotateCcw, Zap, Layout } from 'lucide-react';

interface FlowchartProps {
  text: string;
}

const nodeTypes = {
  start: { background: '#10b981', color: 'white' }, // green
  process: { background: '#3b82f6', color: 'white' }, // blue
  decision: { background: '#f59e0b', color: 'white' }, // amber
  end: { background: '#ef4444', color: 'white' }, // red
};

const convertToReactFlowNodes = (processedNodes: ProcessedNode[]): Node[] => {
  return processedNodes.map(node => ({
    id: node.id,
    position: node.position,
    data: { label: node.label },
    type: 'default',
    style: {
      background: nodeTypes[node.type].background,
      color: nodeTypes[node.type].color,
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '10px 15px',
      fontSize: '12px',
      fontWeight: '500',
      width: node.type === 'decision' ? 180 : 160,
      textAlign: 'center',
      wordWrap: 'break-word',
    },
  }));
};

const convertToReactFlowEdges = (processedEdges: ProcessedEdge[]): Edge[] => {
  return processedEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: true,
    style: { 
      stroke: 'rgba(255, 255, 255, 0.4)', 
      strokeWidth: 2 
    },
    label: edge.label,
    labelStyle: {
      fontSize: '10px',
      fontWeight: '500',
      fill: 'white',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '2px 6px',
      borderRadius: '4px',
    },
  }));
};

export default function Flowchart({ text }: FlowchartProps) {
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('vertical');
  const [isLoading, setIsLoading] = useState(true);
  const [processedData, setProcessedData] = useState<{ nodes: ProcessedNode[]; edges: ProcessedEdge[] } | null>(null);
  
  // Process text when it changes
  useEffect(() => {
    const processText = async () => {
      if (!text.trim()) {
        setProcessedData(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const result = TextProcessor.generateFlowchart(text);
      setProcessedData(result);
      setIsLoading(false);
    };
    
    processText();
  }, [text]);
  
  // Convert processed data to ReactFlow format
  const reactFlowNodes = processedData ? convertToReactFlowNodes(processedData.nodes) : [];
  const reactFlowEdges = processedData ? convertToReactFlowEdges(processedData.edges) : [];
  
  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);
  
  // Update nodes and edges when processed data changes
  useEffect(() => {
    if (processedData) {
      const newNodes = convertToReactFlowNodes(processedData.nodes);
      const newEdges = convertToReactFlowEdges(processedData.edges);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [processedData, setNodes, setEdges]);
  
  const toggleDirection = () => {
    if (!processedData) return;
    
    const newDirection = direction === 'vertical' ? 'horizontal' : 'vertical';
    setDirection(newDirection);
    
    // Recalculate positions based on direction
    const spacing = newDirection === 'vertical' ? { x: 0, y: 120 } : { x: 250, y: 0 };
    const startPos = { x: newDirection === 'vertical' ? 400 : 100, y: 50 };
    
    const updatedNodes = processedData.nodes.map((node, index) => ({
      ...node,
      position: {
        x: startPos.x + (spacing.x * index),
        y: startPos.y + (spacing.y * index)
      }
    }));
    
    const newReactFlowNodes = convertToReactFlowNodes(updatedNodes);
    setNodes(newReactFlowNodes);
  };
  
  const getNodeTypeCount = (type: string) => {
    return processedData?.nodes.filter(node => node.type === type).length || 0;
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mb-4"></div>
        <p className="text-text-secondary">Generating flowchart from your notes...</p>
        <p className="text-xs text-text-secondary mt-2">Analyzing process steps and decision points</p>
      </div>
    );
  }
  
  if (!processedData || processedData.nodes.length === 0) {
    return (
      <div className="text-center text-text-secondary p-8">
        <RotateCcw size={48} className="mx-auto mb-4 opacity-40" />
        <h3 className="text-lg font-medium text-white mb-2">No flowchart generated</h3>
        <p>The text doesn't contain enough process steps to create a flowchart.</p>
        <p className="text-sm mt-2">Try adding:</p>
        <ul className="text-sm mt-2 list-disc list-inside space-y-1">
          <li>Numbered steps (1. First step, 2. Second step)</li>
          <li>Process indicators (First, Next, Then, Finally)</li>
          <li>Action verbs (Create, Analyze, Implement, etc.)</li>
          <li>Decision points (If, When, Choose, etc.)</li>
        </ul>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Zap size={20} className="text-blue-400" />
            Process Flowchart
          </h3>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>Nodes: {processedData.nodes.length}</span>
            <span>Connections: {processedData.edges.length}</span>
          </div>
        </div>
        <button
          onClick={toggleDirection}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Layout size={16} />
          {direction === 'vertical' ? 'Horizontal' : 'Vertical'} Layout
        </button>
      </div>
      
      {/* Node type statistics */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-green-400">Start: {getNodeTypeCount('start')}</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-blue-400">Process: {getNodeTypeCount('process')}</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-yellow-400">Decision: {getNodeTypeCount('decision')}</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-red-400">End: {getNodeTypeCount('end')}</span>
        </div>
      </div>
      
      {/* Flowchart */}
      <div style={{ width: '100%', height: '600px' }} className="bg-background rounded-lg border border-white/10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background 
            color="#374151" 
            gap={20} 
            size={1}
          />
          <Controls 
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <MiniMap
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            nodeColor={(node) => {
              // Determine node type by background color
              if (node.style?.background === '#10b981') return '#10b981';
              if (node.style?.background === '#f59e0b') return '#f59e0b';
              if (node.style?.background === '#ef4444') return '#ef4444';
              return '#3b82f6';
            }}
          />
        </ReactFlow>
      </div>
      
      {/* Instructions */}
      <div className="p-4 bg-primary rounded-lg border border-white/10">
        <h4 className="text-sm font-medium text-white mb-2">Interactive Features:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-text-secondary">
          <div>
            <strong>Navigation:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Drag nodes to rearrange them</li>
              <li>• Mouse wheel to zoom in/out</li>
              <li>• Right-click drag to pan around</li>
            </ul>
          </div>
          <div>
            <strong>Controls:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Use control panel for zoom/fit</li>
              <li>• Toggle layout for better organization</li>
              <li>• Mini-map shows full overview</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 