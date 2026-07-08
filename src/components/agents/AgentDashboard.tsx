import React, { useState, useEffect } from 'react';
import { Users, Play, Activity, Terminal, Shield, Award, AlertCircle, HelpCircle, Layers, ArrowRight } from 'lucide-react';

export default function AgentDashboard() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [task, setTask] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Framework statistics
  const [stats, setStats] = useState<any>({
    queueLength: 0,
    activeTasks: 0,
    delegationCount: 0,
    delegationLogs: []
  });

  useEffect(() => {
    loadAgents();
    loadStats();
    const interval = setInterval(() => {
      loadStats();
    }, 4000); // Poll agent stats every 4s
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data);
      if (data.length > 0 && !selectedAgentId) {
        setSelectedAgentId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/agents/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecute = async () => {
    if (!task || !selectedAgentId) return;
    setExecuting(true);
    setResult(null);
    try {
      const res = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgentId, task })
      });
      const data = await res.json();
      setResult(data.result);
      loadStats(); // Reload queue and logs
    } catch (e) {
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-500" />
            AI Agent Team Framework
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">Autonomous Multi-Agent Task Orchestration, Priority Scheduling & Delegation</p>
        </div>

        <div className="flex flex-wrap gap-4 font-mono text-[11px]">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-right">
            <span className="text-zinc-500 text-[8px] block uppercase">ACTIVE QUEUE</span>
            <span className={stats.queueLength > 0 ? "text-amber-400 font-bold" : "text-zinc-400 font-bold"}>
              {stats.queueLength} Tasks
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-right">
            <span className="text-zinc-500 text-[8px] block uppercase">DELEGATION LOOPS</span>
            <span className="text-purple-400 font-bold">{stats.delegationCount} runs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Registered Specialists list */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Registered AI Specialists</h3>
          <div className="space-y-3">
            {agents.map(a => (
              <div 
                key={a.id} 
                onClick={() => setSelectedAgentId(a.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedAgentId === a.id 
                    ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_12px_rgba(147,51,234,0.1)]' 
                    : 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-zinc-200 text-xs">{a.name}</span>
                  <span className={`text-[8px] font-mono px-1 py-0.2 rounded border ${
                    a.config?.priority >= 9 
                      ? 'bg-red-950/50 text-red-400 border-red-900/40' 
                      : 'bg-zinc-950 text-zinc-400 border-zinc-850'
                  }`}>
                    PRIORITY: {a.config?.priority || 5}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mb-2">{a.role}</div>
                <div className="flex flex-wrap gap-1">
                  {a.capabilities.map((c: string) => (
                    <span key={c} className="text-[9px] bg-zinc-950 text-purple-400 px-1.5 py-0.3 rounded border border-zinc-850 uppercase font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Identity card, workbench execution & delegation log */}
        <div className="xl:col-span-2 space-y-6">
          
          {selectedAgent && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
              {/* Agent Profile Details Card */}
              <div className="border-b border-zinc-850 pb-3 flex items-start justify-between">
                <div>
                  <h4 className="text-xs text-purple-400 font-mono font-bold uppercase tracking-wider">Agent Profile Cards</h4>
                  <div className="text-sm font-bold text-zinc-100">{selectedAgent.name}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">{selectedAgent.role}</div>
                </div>
                
                <div className="flex items-center space-x-1.5 text-xs font-mono text-zinc-400">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>PERM LEVEL: {selectedAgent.config?.permissions?.join(', ')}</span>
                </div>
              </div>

              {/* Grid with goals, competencies & boundaries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-zinc-950 p-3 rounded border border-zinc-850">
                  <div className="flex items-center text-zinc-400 font-bold mb-2">
                    <Award className="w-3.5 h-3.5 mr-1 text-purple-400" /> MISSION GOALS
                  </div>
                  <ul className="space-y-1 text-zinc-400 text-[11px] list-disc pl-4">
                    {selectedAgent.config?.goals?.map((g: string, i: number) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-zinc-950 p-3 rounded border border-zinc-850">
                  <div className="flex items-center text-zinc-400 font-bold mb-2">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-400" /> LIMIT CONSTRAINTS
                  </div>
                  <ul className="space-y-1 text-zinc-400 text-[11px] list-disc pl-4">
                    {selectedAgent.config?.limits?.map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Task execution workbench */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block">Invia Direttiva all'Agente</label>
                <textarea
                  value={task}
                  onChange={e => setTask(e.target.value)}
                  className="w-full h-24 bg-zinc-950 border border-zinc-850 rounded p-3 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 font-mono resize-none"
                  placeholder={`Assegna un obiettivo a ${selectedAgent.name}... Ad esempio: 'Fai un controllo di sicurezza' o 'Estrai context con RAG per il modulo database'`}
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500">
                    *Il supervisore delegherà automaticamente i compiti agli esperti se richiesto.
                  </span>
                  <button
                    onClick={handleExecute}
                    disabled={executing || !task}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center transition-all cursor-pointer"
                  >
                    {executing ? <Activity className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Esegui Direttiva
                  </button>
                </div>
              </div>

              {/* Result output display */}
              {result && (
                <div className="pt-4 border-t border-zinc-850 space-y-2">
                  <div className="flex items-center text-xs text-purple-400 font-mono font-bold">
                    <Terminal className="w-4 h-4 mr-1.5" /> AGENT COGNITIVE REPORT
                  </div>
                  <div className="bg-zinc-950 p-4 rounded border border-zinc-850 text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                    {result}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Autonomous Delegation logs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center mb-3">
              <Layers className="w-4 h-4 mr-2 text-violet-400" /> Registro Deleghe & Collaborazione Team
            </h3>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {stats.delegationLogs && stats.delegationLogs.map((log: any, idx: number) => (
                <div key={idx} className="bg-zinc-950 p-3 rounded border border-zinc-850 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-blue-400 font-bold">{log.fromAgent}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="text-purple-400 font-bold">{log.toAgent}</span>
                    </div>
                    <span className="text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-mono">Compito: "{log.task}"</p>
                  {log.result && (
                    <div className="text-[9px] bg-zinc-900/60 p-2 rounded text-zinc-400 border border-zinc-850 leading-normal max-h-[100px] overflow-y-auto font-mono">
                      {log.result.slice(0, 200)}...
                    </div>
                  )}
                </div>
              ))}
              {(!stats.delegationLogs || stats.delegationLogs.length === 0) && (
                <div className="text-center text-zinc-600 font-mono text-xs py-6">Nessuna delega registrata. Assegna compiti complessi per avviare la collaborazione.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
