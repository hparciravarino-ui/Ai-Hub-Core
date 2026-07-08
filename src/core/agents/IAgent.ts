export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: any[];
  toolCallId?: string;
  timestamp: string;
}

export interface IAgentTool {
  name: string;
  description: string;
  parametersSchema?: any; // JSON schema of parameters
  execute(params: any): Promise<any>;
}

export interface AgentConfig {
  goals: string[];
  competencies: string[];
  limits: string[];
  priority: number; // 1 (low) - 10 (high)
  permissions: string[];
  timeoutMs?: number;
}

export interface IAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  config: AgentConfig;
  executeTask(task: string, context?: any): Promise<string>;
  getMemory(): AgentMessage[];
  clearMemory(): void;
  getTools(): IAgentTool[];
}
