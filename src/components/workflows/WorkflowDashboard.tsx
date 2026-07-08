import React, { useState, useEffect } from 'react';
import { GitMerge, Play, Activity, Code, Layers, RotateCcw, AlertTriangle, ShieldCheck, Terminal, HelpCircle, CheckCircle } from 'lucide-react';

export default function WorkflowDashboard() {
  const [executing, setExecuting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Custom inputs for nodes
  const [ragQuery, setRagQuery] = useState("Modello architettura Clean");
  const [coderTask, setCoderTask] = useState("Implementa una classe TypeScript SOLID basandoti sull'architettura descritta.");
  
  // Execution result tracking
  const [traceResult, setTraceResult] = useState<any>(null);
  const [nodeLogs, setNodeLogs] = useState<any[]>([]);
  const [variables, setVariables] = useState<any>({});
  const [checkpoints, setCheckpoints] = useState<any[]>([]);

  // Workflow structure setup
  const mockWorkflow = {
    id: "wf_1",
    name: "Autonomous RAG & Code Synthesis Pipeline",
    description: "Orchestrates knowledge search, context interpolation, code-architect review, and safety logs validation.",
    startNodeId: "node_rag",
    nodes: [
      { 
        id: "node_rag", 
        type: "rag", 
        config: { query: ragQuery, topK: 1 }, 
        nextNodes: ["node_agent"] 
      },
      { 
        id: "node_agent", 
        type: "agent", 
        config: { agentId: "agent-architect", taskTemplate: coderTask }, 
        nextNodes: ["node_output"] 
      },
      { 
        id: "node_output", 
        type: "output", 
        config: { format: "markdown" }, 
        nextNodes: [] 
      }
    ]
  };

  const handleExecute = async () => {
    setExecuting(true);
    setSuccessMsg(null);
    setTraceResult(null);
    setNodeLogs([]);
    setVariables({});
    setCheckpoints([]);
    
    try {
      const res = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workflow: mockWorkflow, 
          input: { 
            timestamp: new Date().toISOString(),
            author: 'Chief AI Architect'
          } 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setTraceResult(data.result);
        setNodeLogs(data.history || []);
        setVariables(data.result.variables || {});
        setCheckpoints(data.checkpoints || []);
        setSuccessMsg(`Workflow completato! Eseguiti ${data.history?.length || 0} nodi in sicurezza.`);
      } else {
        setSuccessMsg(`Workflow fallito: ${data.error}`);
      }
    } catch (e: any) {
      console.error(e);
      setSuccessMsg(`Errore esecuzione: ${e.message}`);
    } finally {
      setExecuting(false);
    }
  };

  // Perform a real server-side rollback to a checkpoint
  const handleRollback = async (checkpointId: string) => {
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/workflows/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workflowId: mockWorkflow.id, 
          checkpointId 
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Rollback eseguito con successo! Stato ripristinato al checkpoint "${checkpointId}".`);
        // Update local state to match the returned rollback data
        setVariables(data.variables || {});
        setCheckpoints(data.remainingCheckpoints || checkpoints);
      } else {
        setSuccessMsg(`Rollback fallito: ${data.error}`);
      }
    } catch (e: any) {
      console.error(e);
      setSuccessMsg(`Errore rollback: ${e.message}`);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center">
            <GitMerge className="w-5 h-5 mr-2 text-emerald-500 animate-pulse" />
            Workflow Automation Architect
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">Fault-Tolerant Node Engine, Context Interpolation & Point-In-Time Rollbacks</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-right font-mono text-[11px]">
          <span className="text-zinc-500 text-[8px] block uppercase">SANDBOX ISOLATION</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> STRICT ACTIVE
          </span>
        </div>
      </div>

      {/* Success/Error Alerts banner */}
      {successMsg && (
        <div className="bg-zinc-950 p-3 rounded border border-zinc-800 flex items-center space-x-2 text-xs font-mono text-zinc-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section (Column span 5): Node pipeline customized form parameters */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center">
              <Code className="w-4 h-4 mr-2 text-emerald-400" /> Parametri Canale Pipeline
            </h3>
            
            <div className="space-y-4">
              {/* Node 1: RAG config */}
              <div className="border border-zinc-800/80 bg-zinc-950 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400 font-mono">1. RAG Node Configuration</span>
                  <span className="text-[9px] bg-zinc-900 text-zinc-400 font-mono border border-zinc-800 px-1.5 py-0.2 rounded">INPUT</span>
                </div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block">Termine di ricerca</label>
                <input 
                  type="text" 
                  value={ragQuery}
                  onChange={e => setRagQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="es. Clean Architecture SOLID"
                />
              </div>

              {/* Node 2: Agent config */}
              <div className="border border-zinc-800/80 bg-zinc-950 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-400 font-mono">2. Specialist Agent Node</span>
                  <span className="text-[9px] bg-zinc-900 text-purple-400 font-mono border border-purple-950/40 px-1.5 py-0.2 rounded">LLM RUN</span>
                </div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block">Modello / Template Istruzioni</label>
                <textarea 
                  value={coderTask}
                  onChange={e => setCoderTask(e.target.value)}
                  className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 font-mono resize-none"
                  placeholder="Scrivi le direttive per l'agente..."
                />
              </div>

              {/* Trigger Build Execution */}
              <button
                onClick={handleExecute}
                disabled={executing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
              >
                {executing ? <Activity className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                Esegui Workflow Canale
              </button>
            </div>
          </div>

          {/* Point-in-Time Checkpoints & Recovery snap panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center">
              <RotateCcw className="w-4 h-4 mr-2 text-sky-400" /> Checkpoint & Recovery State
            </h3>
            <p className="text-[10px] text-zinc-500 leading-normal font-mono">
              In caso di errori o test su contesti alternativi, esegui il rollback immediato allo stato salvato in memoria sandbox per quel nodo.
            </p>

            <div className="space-y-2">
              {checkpoints.map(cp => (
                <div key={cp.id} className="bg-zinc-950 border border-zinc-850 rounded p-2.5 flex items-center justify-between font-mono text-xs">
                  <div className="space-y-0.5">
                    <span className="text-sky-400 font-bold truncate block max-w-[150px]">{cp.nodeId}</span>
                    <span className="text-[9px] text-zinc-500">Variables saved: {Object.keys(cp.variables).length}</span>
                  </div>
                  <button
                    onClick={() => handleRollback(cp.id)}
                    className="px-2.5 py-1 text-[10px] border border-sky-900 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 rounded font-bold transition-colors flex items-center"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Rollback
                  </button>
                </div>
              ))}
              {checkpoints.length === 0 && (
                <div className="text-center text-zinc-600 font-mono text-[11px] py-4">Nessun checkpoint attivo. Esegui il workflow per registrare lo stato.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section (Column span 7): Execution output traces, nodes complete and system variables */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Real-time execution node trace lists */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-emerald-400" /> Log Sequenza Esecuzione
            </h3>
            
            <div className="relative border-l-2 border-zinc-800 ml-3 pl-5 space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar font-mono text-[11px]">
              {nodeLogs.map((log, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-400">{log.nodeId} ({log.type})</span>
                    <span className="text-zinc-500 text-[10px]">{log.durationMs} ms</span>
                  </div>
                  <span className="text-zinc-500 text-[10px] block">TIMESTAMP: {new Date(log.timestamp).toLocaleTimeString()}</span>
                  
                  {log.output && log.output.ragCount !== undefined && (
                    <span className="text-zinc-400 text-[10px] block mt-0.5">Retrieved chunks: {log.output.ragCount}</span>
                  )}
                  {log.output && log.output.resultLength !== undefined && (
                    <span className="text-zinc-400 text-[10px] block mt-0.5">Response words count: {log.output.resultLength}</span>
                  )}
                </div>
              ))}
              {nodeLogs.length === 0 && (
                <div className="text-zinc-600 font-mono text-[11px] py-6 pl-2">Avvia la pipeline per visualizzare il tracciamento dei nodi.</div>
              )}
            </div>
          </div>

          {/* Variables and final response panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center">
              <Terminal className="w-4 h-4 mr-2 text-zinc-400" /> Registro Variabili State & Output Final
            </h3>

            {/* Interpolated variables inspection */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Stato Variabili Interpolate</span>
              <div className="bg-zinc-950 p-3 rounded border border-zinc-850 font-mono text-[10px] text-zinc-300 max-h-[140px] overflow-y-auto">
                {Object.keys(variables).length > 0 ? (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(variables, null, 2)}</pre>
                ) : (
                  <div className="text-zinc-600 text-center">Nessuna variabile registrata nello scope locale.</div>
                )}
              </div>
            </div>

            {/* Markdown Output response if available */}
            {variables.agentResult && (
              <div className="space-y-2 pt-2 border-t border-zinc-850">
                <span className="text-[10px] font-mono text-purple-400 uppercase block font-bold">Output Codice Sintetizzato</span>
                <div className="bg-zinc-950 p-4 rounded border border-zinc-850 text-xs text-zinc-300 whitespace-pre-wrap font-mono max-h-[220px] overflow-y-auto">
                  {variables.agentResult}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
