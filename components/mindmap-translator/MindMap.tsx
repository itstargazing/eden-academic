import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  addEdge,
  Connection as ReactFlowConnection,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapProps {
  text: string;
}

interface ParsedNode {
  id: string;
  text: string;
  level: number;
  parent?: string;
}

const parseIndentedText = (text: string): ParsedNode[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const nodes: ParsedNode[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Calculate indentation level
    const indentationMatch = line.match(/^(\s*)/);
    const indentation = indentationMatch ? indentationMatch[1].length : 0;
    const level = Math.floor(indentation / 4); // Assuming 4 spaces per level
    
    // Find parent node
    let parent: string | undefined;
    if (level > 0) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].level === level - 1) {
          parent = nodes[i].id;
          break;
        }
      }
    }
    
    nodes.push({
      id: `node-${index}`,
      text: trimmedLine,
      level,
      parent
    });
  });
  
  return nodes;
};

const createNodesAndEdges = (parsedNodes: ParsedNode[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Calculate positions using a radial layout
  parsedNodes.forEach((node, index) => {
    const isRoot = node.level === 0;
    const angle = (index / parsedNodes.length) * 2 * Math.PI;
    const radius = node.level * 200; // Increase radius for each level
    
    const x = isRoot ? 0 : Math.cos(angle) * radius;
    const y = isRoot ? 0 : Math.sin(angle) * radius;
    
    nodes.push({
      id: node.id,
      position: { x: x + 500, y: y + 300 }, // Center the layout
      data: { label: node.text },
      type: 'mindMapNode',
      style: {
        background: isRoot ? '#d9d9d9' : '#ebebeb',
        color: '#0a0a0a',
        border: isRoot ? '2px solid #b0b0b0' : '1px solid #b0b0b0',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: isRoot ? '14px' : '12px',
        fontWeight: isRoot ? '600' : 'normal',
        width: 'auto',
        minWidth: '120px',
        maxWidth: '200px',
        textAlign: 'center',
      },
    });
    
    if (node.parent) {
      edges.push({
        id: `edge-${node.parent}-${node.id}`,
        source: node.parent,
        target: node.id,
        type: 'smoothstep',
        style: { stroke: 'rgba(176, 176, 176, 0.95)', strokeWidth: 2 },
        animated: false,
      });
    }
  });
  
  return { nodes, edges };
};

export default function MindMap({ text }: MindMapProps) {
  const parsedNodes = useMemo(() => parseIndentedText(text), [text]);
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => createNodesAndEdges(parsedNodes),
    [parsedNodes]
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback((params: ReactFlowConnection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);
  
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#b0b0b0" />
        <Controls
          style={{
            background: '#ebebeb',
            border: '1px solid #b0b0b0',
          }}
        />
        <MiniMap
          style={{
            backgroundColor: '#d9d9d9',
            border: '1px solid #b0b0b0',
          }}
          nodeColor={() => '#888888'}
        />
      </ReactFlow>
    </div>
  );
} 