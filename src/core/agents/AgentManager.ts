import { IAgent } from './IAgent';
import { BaseAgent } from './BaseAgent';
import { eventBus } from '../events/EventBus';

export interface QueuedAgentTask {
  id: string;
  agentId: string;
  task: string;
  context?: any;
  priority: number;
  timestamp: number;
  resolve: (value: string) => void;
  reject: (reason: any) => void;
}

export interface DelegationLog {
  id: string;
  fromAgent: string;
  toAgent: string;
  task: string;
  result?: string;
  timestamp: string;
}

export class AgentManager {
  private static agents: Map<string, IAgent> = new Map();
  private static taskQueue: QueuedAgentTask[] = [];
  private static activeTaskCount = 0;
  private static isProcessingQueue = false;
  
  // Trace logs
  private static delegations: DelegationLog[] = [];

  // Default initial registry flag
  private static initialized = false;

  public static initializeDefaultAgents() {
    if (this.initialized) return;

    // 1. Chief AI Architect
    this.registerAgent(new BaseAgent(
      'agent-architect',
      'Chief AI Architect',
      'System Architecture',
      'You are the Chief AI Architect responsible for high-level system design. You coordinate backend, frontend, database, and DevOps subsystems.',
      ['Architecture', 'System Design', 'Supervisor'],
      [],
      { priority: 10, goals: ['Plan clean, SOLID microarchitectures', 'Oversee workflow engines'], permissions: ['*'] }
    ));

    // 2. Senior RAG Engineer
    this.registerAgent(new BaseAgent(
      'agent-rag',
      'Senior RAG Engineer',
      'Knowledge Management',
      'You are the Senior RAG Engineer responsible for high-performance vector search, PDF parsing, document cleaning, and retrieval evaluation.',
      ['Vector DB', 'Embeddings', 'Search'],
      [],
      { priority: 8, goals: ['Optimize retrieval precision', 'Enrich metadata structures'] }
    ));

    // 3. Senior Backend Engineer (Coding Agent)
    this.registerAgent(new BaseAgent(
      'agent-coder',
      'Senior Backend Engineer',
      'Code Implementation',
      'You are the Senior Backend Engineer responsible for writing clean, SOLID TypeScript/Node.js backend microservices and APIs.',
      ['TypeScript', 'Node.js', 'Clean Architecture'],
      [],
      { priority: 9, goals: ['Enforce SOLID principles', 'Minimize memory and runtime latency'] }
    ));

    // 4. Cyber Security Architect
    this.registerAgent(new BaseAgent(
      'agent-security',
      'Cyber Security Architect',
      'Platform Security hardening',
      'You are the Cyber Security Architect. You audit source files for code injections, prompt injection vulnerability, and secure vault storage leaks.',
      ['Security Audit', 'Sandbox Verification', 'Vault Guarding'],
      [],
      { priority: 9, goals: ['Prevent injection attacks', 'Audit cryptographic signatures'] }
    ));

    // 5. DevOps & Automation Engineer
    this.registerAgent(new BaseAgent(
      'agent-devops',
      'DevOps & Automation Specialist',
      'Orchestration and release releases',
      'You are the DevOps Engineer responsible for CI/CD, script automation, bundle sizing, dockerization, and automatic crash recovery setups.',
      ['Docker', 'Bash', 'IPC', 'Packaging'],
      [],
      { priority: 7, goals: ['Ensure reliable crash recovery', 'Maintain lightweight installer binaries'] }
    ));

    // 6. Principal QA Tester
    this.registerAgent(new BaseAgent(
      'agent-tester',
      'Principal QA Engineer',
      'Quality Assurance',
      'You are the Principal QA Engineer. You generate and run Unit, Integration, E2E, and regression test suites, monitoring code coverage.',
      ['Testing', 'Coverage Check', 'Linter'],
      [],
      { priority: 8, goals: ['Achieve high code coverage', 'Detect regressions early'] }
    ));

    this.initialized = true;
  }

  public static registerAgent(agent: IAgent) {
    this.agents.set(agent.id, agent);
  }

  public static getAgent(id: string): IAgent | undefined {
    this.initializeDefaultAgents();
    return this.agents.get(id);
  }

  public static getAllAgents(): IAgent[] {
    this.initializeDefaultAgents();
    return Array.from(this.agents.values());
  }

  // Multi-agent Collaboration: Delegation protocol
  public static async delegateTask(fromAgentId: string, toAgentId: string, subtask: string, context?: any): Promise<string> {
    const fromAgent = this.getAgent(fromAgentId);
    const toAgent = this.getAgent(toAgentId);

    if (!fromAgent || !toAgent) {
      throw new Error(`Delegation failed: From "${fromAgentId}" or To "${toAgentId}" agent does not exist.`);
    }

    const delegationId = `del_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const log: DelegationLog = {
      id: delegationId,
      fromAgent: fromAgent.name,
      toAgent: toAgent.name,
      task: subtask,
      timestamp: new Date().toISOString()
    };
    
    this.delegations.push(log);
    eventBus.publish('agent_delegation_started', log);

    // Share memory context before execution
    const sharedContext = {
      delegatedBy: fromAgentId,
      originalContext: context,
      delegationPath: `${fromAgentId} -> ${toAgentId}`
    };

    try {
      const result = await toAgent.executeTask(subtask, sharedContext);
      log.result = result;
      eventBus.publish('agent_delegation_completed', log);
      return result;
    } catch (err: any) {
      log.result = `[Error executing delegated task]: ${err.message}`;
      eventBus.publish('agent_delegation_failed', { ...log, error: err.message });
      throw err;
    }
  }

  // Priority-based Task Queue Scheduling
  public static async orchestrateTask(agentId: string, task: string, context?: any): Promise<string> {
    const agent = this.getAgent(agentId);
    if (!agent) throw new Error(`Agent with ID "${agentId}" not found`);

    return new Promise((resolve, reject) => {
      const queuedTask: QueuedAgentTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        agentId,
        task,
        context,
        priority: agent.config.priority,
        timestamp: Date.now(),
        resolve,
        reject
      };

      this.taskQueue.push(queuedTask);
      
      // Sort queue by priority (descending) and then by timestamp (ascending)
      this.taskQueue.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return a.timestamp - b.timestamp;
      });

      eventBus.publish('agent_task_queued', { taskId: queuedTask.id, agentId, priority: queuedTask.priority });
      
      this.processQueue();
    });
  }

  private static async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      this.activeTaskCount++;
      eventBus.publish('agent_queue_processing', { taskId: task.id, activeCount: this.activeTaskCount });

      try {
        const agent = this.getAgent(task.agentId)!;
        
        // Smart Autonomous Supervisor Coordination:
        // If a high-level query is routed to the Architect agent, let it automatically coordinate sub-tasks!
        if (task.agentId === 'agent-architect' && (task.task.toLowerCase().includes('database') || task.task.toLowerCase().includes('rag') || task.task.toLowerCase().includes('secure'))) {
          const subResponse = await this.coordinateArchitectSubTasks(task.task, task.context);
          task.resolve(subResponse);
        } else {
          // Standard isolated execution
          const response = await agent.executeTask(task.task, task.context);
          task.resolve(response);
        }
      } catch (err) {
        task.reject(err);
      } finally {
        this.activeTaskCount--;
      }
    }

    this.isProcessingQueue = false;
  }

  private static async coordinateArchitectSubTasks(taskDescription: string, context?: any): Promise<string> {
    let result = `=== Chief AI Architect Coordination System ===\nReceived main architect directive: "${taskDescription}"\n\n`;
    
    if (taskDescription.toLowerCase().includes('rag') || taskDescription.toLowerCase().includes('search')) {
      result += `[Action] Architect delegating vector search and knowledge extraction to RAG Specialist...\n`;
      const ragResponse = await this.delegateTask('agent-architect', 'agent-rag', `Extract context for: "${taskDescription}"`, context);
      result += `[Specialist Response (RAG)]:\n${ragResponse}\n\n`;
    }

    if (taskDescription.toLowerCase().includes('code') || taskDescription.toLowerCase().includes('database')) {
      result += `[Action] Architect delegating source/API code generation to Senior Backend Specialist...\n`;
      const coderResponse = await this.delegateTask('agent-architect', 'agent-coder', `Implement backend module for: "${taskDescription}"`, context);
      result += `[Specialist Response (Backend)]:\n${coderResponse}\n\n`;
    }

    if (taskDescription.toLowerCase().includes('security') || taskDescription.toLowerCase().includes('secure')) {
      result += `[Action] Architect delegating compliance & vault audit to Cyber Security Specialist...\n`;
      const securityResponse = await this.delegateTask('agent-architect', 'agent-security', `Audit code logic for potential risks in: "${taskDescription}"`, context);
      result += `[Specialist Response (Security)]:\n${securityResponse}\n\n`;
    }

    result += `Architect Consolidated Plan: Successfully completed all sub-task delegation trails. Refined design is fully certified.`;
    return result;
  }

  public static getDelegations(): DelegationLog[] {
    return this.delegations;
  }

  public static getStats() {
    this.initializeDefaultAgents();
    return {
      totalAgents: this.agents.size,
      queueLength: this.taskQueue.length,
      activeTasks: this.activeTaskCount,
      delegationCount: this.delegations.length,
      delegationLogs: this.delegations.slice(-20) // Latest 20
    };
  }

  public static clearStats() {
    this.taskQueue = [];
    this.delegations = [];
    this.activeTaskCount = 0;
    this.isProcessingQueue = false;
  }
}
export type { IAgent };
