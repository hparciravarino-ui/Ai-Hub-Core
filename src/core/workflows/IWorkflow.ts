export type NodeType = 'input' | 'decision' | 'llm' | 'agent' | 'database' | 'rag' | 'api' | 'script' | 'output';

export interface IWorkflowNode {
  id: string;
  type: NodeType;
  config: Record<string, any>;
  nextNodes: string[];
}

export interface IWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: IWorkflowNode[];
  startNodeId: string;
}
