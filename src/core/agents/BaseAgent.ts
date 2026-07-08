import { IAgent, AgentMessage, IAgentTool, AgentConfig } from './IAgent';
import { Container } from '../di/Container';
import { DITokens } from '../di/tokens';
import { IAIService } from '../services/IAIService';
import { eventBus } from '../events/EventBus';

export class BaseAgent implements IAgent {
  public id: string;
  public name: string;
  public role: string;
  public capabilities: string[];
  public config: AgentConfig;
  
  protected memory: AgentMessage[] = [];
  protected tools: IAgentTool[] = [];
  protected systemPrompt: string;

  constructor(
    id: string,
    name: string,
    role: string,
    systemPrompt: string,
    capabilities: string[] = [],
    tools: IAgentTool[] = [],
    config?: Partial<AgentConfig>
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.systemPrompt = systemPrompt;
    this.capabilities = capabilities;
    this.tools = tools;
    
    // Default config values
    this.config = {
      goals: config?.goals || ['Optimize architecture', 'Ensure clean execution'],
      competencies: config?.competencies || capabilities,
      limits: config?.limits || ['No deletion without approval', 'API Rate limit 100/min'],
      priority: config?.priority || 5,
      permissions: config?.permissions || ['*'],
      timeoutMs: config?.timeoutMs || 30000
    };

    this.initializeMemory();
  }

  protected initializeMemory() {
    const fullSystemInstruction = `
=== AGENT SYSTEM PROFILE ===
Name: ${this.name}
Role: ${this.role}
System Instructions: ${this.systemPrompt}
Capabilities: ${this.capabilities.join(', ')}

=== OPERATIONAL CONSTRAINTS ===
Goals:
${this.config.goals.map(g => `- ${g}`).join('\n')}

Competencies:
${this.config.competencies.map(c => `- ${c}`).join('\n')}

Limits & Safeguards:
${this.config.limits.map(l => `- ${l}`).join('\n')}

Permissions Level: ${this.config.permissions.join(', ')}
Priority Tier: ${this.config.priority} / 10
`;

    this.memory = [{
      role: 'system',
      content: fullSystemInstruction,
      timestamp: new Date().toISOString()
    }];
  }

  public getMemory() {
    return this.memory;
  }

  public clearMemory() {
    this.initializeMemory();
  }

  public getTools(): IAgentTool[] {
    return this.tools;
  }

  public addTool(tool: IAgentTool) {
    this.tools.push(tool);
  }

  public async executeTask(task: string, context?: any): Promise<string> {
    eventBus.publish('agent_task_started', { agentId: this.id, task });
    
    const taskMessageContent = context 
      ? `[CONTEXT DATA]\n${JSON.stringify(context, null, 2)}\n\n[TASK INSTRUCTION]\n${task}`
      : task;

    this.memory.push({
      role: 'user',
      content: taskMessageContent,
      timestamp: new Date().toISOString()
    });

    const maxRetries = 3;
    let attempt = 0;
    let responseText = '';

    while (attempt < maxRetries) {
      attempt++;
      try {
        // Implement timeout protection
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout exceeded (${this.config.timeoutMs}ms)`)), this.config.timeoutMs)
        );

        const executionPromise = (async () => {
          // Prepare chat history context
          const promptBuilder = this.memory.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
          const systemInstruction = this.memory.find(m => m.role === 'system')?.content;
          
          return Container.resolve<IAIService>(DITokens.AIService).generateText(promptBuilder, systemInstruction);
        })();

        responseText = await Promise.race([executionPromise, timeoutPromise]);
        break; // Success! Break retry loop
      } catch (err: any) {
        console.error(`Agent "${this.id}" task execution attempt ${attempt} failed:`, err.message);
        if (attempt >= maxRetries) {
          responseText = `[AGENT ERROR - TASK FAILED AFTER ${maxRetries} ATTEMPTS]: ${err.message}`;
        } else {
          // Backoff before retry
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    }

    this.memory.push({
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString()
    });

    eventBus.publish('agent_task_completed', { agentId: this.id, result: responseText });
    return responseText;
  }
}
