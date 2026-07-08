import { IWorkflow, IWorkflowNode } from './IWorkflow';
import { eventBus } from '../events/EventBus';
import { AgentManager } from '../agents/AgentManager';
import { RAGService } from '../knowledge/RAGService';
import { Container } from '../di/Container';
import { DITokens } from '../di/tokens';
import { IAIService } from '../services/IAIService';

export interface WorkflowExecutionCheckpoint {
  nodeId: string;
  contextSnapshot: string; // Serialized state
  timestamp: string;
}

export interface WorkflowExecutionRecord {
  executionId: string;
  workflowId: string;
  workflowName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  currentStepId: string | null;
  pathTraced: string[];
  context: Record<string, any>;
  checkpoints: WorkflowExecutionCheckpoint[];
  stats: {
    nodesExecuted: number;
    totalDurationMs: number;
    startedAt: string;
    completedAt?: string;
  };
  error?: string;
}

export class WorkflowEngine {
  private static executionHistory: Map<string, WorkflowExecutionRecord> = new Map();
  private static activeExecutions: Set<string> = new Set();

  public static async executeWorkflow(workflow: IWorkflow, initialInput: any): Promise<any> {
    const executionId = `wf_exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.activeExecutions.add(executionId);

    const record: WorkflowExecutionRecord = {
      executionId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'RUNNING',
      currentStepId: workflow.startNodeId,
      pathTraced: [],
      context: { ...initialInput, env: { time: new Date().toISOString() } },
      checkpoints: [],
      stats: {
        nodesExecuted: 0,
        totalDurationMs: 0,
        startedAt: new Date().toISOString()
      }
    };

    this.executionHistory.set(executionId, record);
    eventBus.publish('workflow_started', { workflowId: workflow.id, executionId, name: workflow.name });

    let currentNodeId: string | null = workflow.startNodeId;
    const startTime = Date.now();

    try {
      while (currentNodeId) {
        const node: IWorkflowNode | undefined = workflow.nodes.find(n => n.id === currentNodeId);
        if (!node) {
          throw new Error(`Node ID "${currentNodeId}" not declared in workflow structure.`);
        }

        record.currentStepId = currentNodeId;
        record.pathTraced.push(currentNodeId);
        record.stats.nodesExecuted++;

        // 1. Create State Checkpoint for Rollback Support
        record.checkpoints.push({
          nodeId: currentNodeId,
          contextSnapshot: JSON.stringify(record.context),
          timestamp: new Date().toISOString()
        });

        eventBus.publish('workflow_node_started', { workflowId: workflow.id, executionId, nodeId: node.id, type: node.type });

        // 2. Variable Interpolation inside Configuration
        const interpolatedConfig = this.interpolateConfig(node.config, record.context);

        // 3. Execute Specialized Node Type
        const nodeResult = await this.executeNode(node.type, interpolatedConfig, record.context);
        
        // Merge node output into context
        record.context = {
          ...record.context,
          [node.id]: nodeResult,
          latestOutput: nodeResult
        };

        eventBus.publish('workflow_node_completed', { 
          workflowId: workflow.id, 
          executionId, 
          nodeId: node.id, 
          result: nodeResult 
        });

        // 4. Determine Next Node with Advanced Branching (Decision Support)
        if (node.type === 'decision') {
          const branchingResult = !!nodeResult?.branch;
          const trueNode = node.nextNodes[0];
          const falseNode = node.nextNodes[1] || null;
          currentNodeId = branchingResult ? trueNode : falseNode;
        } else {
          // Standard linear node
          currentNodeId = node.nextNodes.length > 0 ? node.nextNodes[0] : null;
        }

        // Safeguard against infinite loops: limit to 50 nodes per execution
        if (record.stats.nodesExecuted > 50) {
          throw new Error("Loop safety limit reached. Execution halted to prevent resource lock.");
        }
      }

      record.status = 'COMPLETED';
      record.currentStepId = null;
      record.stats.totalDurationMs = Date.now() - startTime;
      record.stats.completedAt = new Date().toISOString();
      
      eventBus.publish('workflow_completed', { 
        workflowId: workflow.id, 
        executionId, 
        finalContext: record.context,
        durationMs: record.stats.totalDurationMs
      });

    } catch (err: any) {
      record.status = 'FAILED';
      record.error = err.message;
      record.stats.totalDurationMs = Date.now() - startTime;
      record.stats.completedAt = new Date().toISOString();

      eventBus.publish('workflow_failed', { 
        workflowId: workflow.id, 
        executionId, 
        nodeId: currentNodeId, 
        error: err.message 
      });

      throw err;
    } finally {
      this.activeExecutions.delete(executionId);
    }

    return record.context;
  }

  // Rolling back execution to a specific checkpoint state
  public static async rollbackExecution(executionId: string, nodeId: string): Promise<WorkflowExecutionRecord> {
    const record = this.executionHistory.get(executionId);
    if (!record) throw new Error(`Execution ID "${executionId}" not found.`);

    const checkpoint = record.checkpoints.find(cp => cp.nodeId === nodeId);
    if (!checkpoint) throw new Error(`No checkpoint found for Node ID "${nodeId}" in execution.`);

    // Restore context snapshot
    record.context = JSON.parse(checkpoint.contextSnapshot);
    record.status = 'ROLLED_BACK';
    record.currentStepId = nodeId;
    
    // Trim path traced to this node
    const nodeIndex = record.pathTraced.indexOf(nodeId);
    if (nodeIndex !== -1) {
      record.pathTraced = record.pathTraced.slice(0, nodeIndex + 1);
    }

    eventBus.publish('workflow_rolled_back', { executionId, restoredNodeId: nodeId });
    return record;
  }

  private static async executeNode(type: string, config: any, context: any): Promise<any> {
    // Artificial latency for visualization
    await new Promise(r => setTimeout(r, 600));

    switch (type) {
      case 'llm':
        const prompt = config.prompt || "Execute standard processing task.";
        const instruction = config.systemInstruction || "You are a helpful workflow agent.";
        return await Container.resolve<IAIService>(DITokens.AIService).generateText(prompt, instruction);

      case 'agent':
        if (!config.agentId) throw new Error("Agent node missing mandatory 'agentId' parameter.");
        const task = config.task || "Process task.";
        return await AgentManager.orchestrateTask(config.agentId, task, context);

      case 'rag':
        const query = config.query || "";
        const topK = config.topK || 3;
        return await RAGService.search(query, topK);

      case 'decision':
        // Evaluate condition (e.g. "context.someVal > 10")
        const condition = config.condition || "true";
        try {
          // Safe eval sandboxed sandbox or simple evaluation
          const fun = new Function('context', `try { return !!(${condition}); } catch (e) { return false; }`);
          const evaluation = fun(context);
          return { branch: evaluation, reason: `Condition evaluated: ${condition} -> ${evaluation}` };
        } catch (e: any) {
          return { branch: false, reason: `Failed to evaluate condition: ${e.message}` };
        }

      case 'api':
      case 'http':
        // Simulate HTTP calls
        return {
          status: 200,
          statusText: "OK",
          data: {
            success: true,
            message: "Simulated endpoint request successful.",
            url: config.url || "https://api.system.internal/v1/trigger",
            method: config.method || "POST",
            payloadReceived: config.body || null
          }
        };

      case 'filesystem':
        // Simulated Secure Sandboxed Filesystem operations
        return {
          operation: config.operation || "write",
          path: config.path || "./tmp/output.txt",
          bytesWritten: config.content ? config.content.length : 124,
          timestamp: new Date().toISOString(),
          status: "SUCCESS"
        };

      case 'loop':
        // Loop state manager
        const currentCount = context.loopCount || 0;
        const limit = config.maxIterations || 5;
        const continueIteration = currentCount < limit;
        return {
          loopCount: currentCount + 1,
          continue: continueIteration,
          limit,
          branch: continueIteration
        };

      case 'email':
        // Simulated alert / notification channel
        return {
          sentTo: config.to || "architect@enterprise.corp",
          subject: config.subject || "Alert notification",
          messageSnippet: config.body ? config.body.slice(0, 50) + "..." : "",
          channel: "SMTP_TLS",
          id: `msg_${Math.random().toString(36).substring(7)}`,
          status: "DELIVERED"
        };

      case 'output':
        return {
          status: 'SUCCESS',
          outputValue: config.value || context.latestOutput || 'No output defined.',
          renderedAt: new Date().toISOString()
        };

      default:
        return { result: `Processed by default unmapped node [${type}]` };
    }
  }

  // String variable interpolation e.g., {{some_id.value}} or {{context_prop}}
  private static interpolateConfig(config: any, context: any): any {
    if (!config) return config;

    if (typeof config === 'string') {
      return config.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
        const path = expression.trim().split('.');
        let current = context;
        for (const part of path) {
          if (current === undefined || current === null) return '';
          current = current[part];
        }
        return current !== undefined ? current : match;
      });
    }

    if (Array.isArray(config)) {
      return config.map(item => this.interpolateConfig(item, context));
    }

    if (typeof config === 'object') {
      const result: Record<string, any> = {};
      for (const key of Object.keys(config)) {
        result[key] = this.interpolateConfig(config[key], context);
      }
      return result;
    }

    return config;
  }

  public static getExecutions(): WorkflowExecutionRecord[] {
    return Array.from(this.executionHistory.values());
  }

  public static getExecutionStats() {
    const executions = this.getExecutions();
    const completed = executions.filter(e => e.status === 'COMPLETED').length;
    const failed = executions.filter(e => e.status === 'FAILED').length;
    const rolledBack = executions.filter(e => e.status === 'ROLLED_BACK').length;

    let totalDuration = 0;
    executions.forEach(e => {
      if (e.stats.totalDurationMs) totalDuration += e.stats.totalDurationMs;
    });

    const avgDuration = executions.length > 0 ? (totalDuration / executions.length) : 0;

    return {
      totalExecutions: executions.length,
      completed,
      failed,
      rolledBack,
      activeCount: this.activeExecutions.size,
      averageDurationMs: parseFloat(avgDuration.toFixed(0)),
      history: executions.slice(-15) // Latest 15
    };
  }

  public static clearStats() {
    this.executionHistory.clear();
    this.activeExecutions.clear();
  }
}
