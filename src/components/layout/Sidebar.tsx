import React from 'react';
import {
  LayoutDashboard, Database, BrainCircuit, Cpu, Wand2, MessageSquare, Folder, Brain, Users, GitMerge, ListOrdered, Blocks, ShieldCheck, Server, BookOpen
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  downloadedModelsCount: number;
}

export function Sidebar({ activeTab, setActiveTab, downloadedModelsCount }: SidebarProps) {
  const getTabClass = (tabId: string, colorClass: string) => {
    return `w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
      activeTab === tabId
        ? `bg-zinc-800/60 ${colorClass === 'text-white' ? 'text-white' : colorClass} border-l-2 ${colorClass.replace('text-', 'border-')} font-bold`
        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
    }`;
  };

  return (
    <aside className="w-64 bg-barbg border-r border-zinc-800 p-4 flex flex-col justify-between shrink-0 overflow-y-auto" id="sidebar-navigation">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest pl-2 mb-2">Dashboard CHATBOT</div>
          <nav className="space-y-1" id="navigation-list-chatbot">
            <button onClick={() => setActiveTab("chat")} className={getTabClass("chat", "text-emerald-400 border-emerald-500")}>
              <MessageSquare className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="flex-1 text-left">Sistema Chat Pro</span>
              <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-mono font-bold border border-emerald-900/60 px-1.5 py-0.2 rounded">NEW</span>
            </button>
            <button onClick={() => setActiveTab("assistant")} className={getTabClass("assistant", "text-white border-emerald-500")}>
              <Cpu className="w-3.5 h-3.5 shrink-0 text-violet-400" />
              <span>Playground & AI Tools</span>
            </button>
          </nav>
        </div>

        <div>
          <div className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest pl-2 mb-2">Info e gestione hardware</div>
          <nav className="space-y-1" id="navigation-list-hardware">
            <button onClick={() => setActiveTab("dashboard")} className={getTabClass("dashboard", "text-white border-emerald-500")}>
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>Pannello di Controllo</span>
            </button>
            <button onClick={() => setActiveTab("system")} className={getTabClass("system", "text-white border-emerald-500")}>
              <Server className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
              <span>Sistema & Telemetria</span>
            </button>
          </nav>
        </div>

        <div>
          <div className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest pl-2 mb-2">Gestione model AI</div>
          <nav className="space-y-1" id="navigation-list-models">
            <button onClick={() => setActiveTab("models")} className={getTabClass("models", "text-white border-emerald-500")}>
              <Database className="w-3.5 h-3.5 shrink-0 text-sky-400" />
              <span className="flex-1 text-left">Gestione Modelli</span>
              {downloadedModelsCount > 0 && (
                <span className="bg-sky-950 text-sky-400 text-[9px] font-mono font-bold border border-sky-900 px-1.5 py-0.2 rounded">
                  {downloadedModelsCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab("optimizer")} className={getTabClass("optimizer", "text-white border-blue-500")}>
              <BrainCircuit className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span>Intelligence Engine</span>
            </button>
            <button onClick={() => setActiveTab("evolution")} className={getTabClass("evolution", "text-emerald-400 border-emerald-500")}>
              <Brain className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="flex-1 text-left">Motore Evolutivo (AEE)</span>
              <span className="bg-purple-950/60 text-purple-400 text-[8px] font-mono font-bold border border-purple-900/60 px-1.5 py-0.2 rounded">AEE</span>
            </button>
            <button onClick={() => setActiveTab("benchmark")} className={getTabClass("benchmark", "text-white border-emerald-500")}>
              <ListOrdered className="w-3.5 h-3.5 shrink-0 text-orange-400" />
              <span>Benchmark Models</span>
            </button>
          </nav>
        </div>

        <div>
          <div className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest pl-2 mb-2">Tutte le altre funzioni</div>
          <nav className="space-y-1" id="navigation-list-other">
            <button onClick={() => setActiveTab("rag")} className={getTabClass("rag", "text-white border-blue-500")}>
              <Database className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <span className="flex-1 text-left">Piattaforma RAG</span>
              <span className="bg-blue-950/60 text-blue-400 text-[8px] font-mono font-bold border border-blue-900/60 px-1.5 py-0.2 rounded">VEC</span>
            </button>
            <button onClick={() => setActiveTab("agents")} className={getTabClass("agents", "text-white border-purple-500")}>
              <Users className="w-3.5 h-3.5 shrink-0 text-purple-400" />
              <span className="flex-1 text-left">Team Multi-Agenti</span>
              <span className="bg-purple-950/60 text-purple-400 text-[8px] font-mono font-bold border border-purple-900/60 px-1.5 py-0.2 rounded">RUN</span>
            </button>
            <button onClick={() => setActiveTab("workflows")} className={getTabClass("workflows", "text-white border-emerald-500")}>
              <GitMerge className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span className="flex-1 text-left">Workflow Automazione</span>
              <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-mono font-bold border border-emerald-900/60 px-1.5 py-0.2 rounded">DAG</span>
            </button>
            <button onClick={() => setActiveTab("scheduler")} className={getTabClass("scheduler", "text-white border-emerald-500")}>
              <ListOrdered className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
              <span>Scheduler Coda</span>
            </button>
            <button onClick={() => setActiveTab("plugins")} className={getTabClass("plugins", "text-white border-emerald-500")}>
              <Blocks className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
              <span>Plugin Estensioni</span>
            </button>
            <button onClick={() => setActiveTab("security")} className={getTabClass("security", "text-white border-emerald-500")}>
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
              <span>Sicurezza & Privacy</span>
            </button>
            <button onClick={() => setActiveTab("filemanager")} className={getTabClass("filemanager", "text-white border-emerald-500")}>
              <Folder className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>File & Storage IO</span>
            </button>
            <button onClick={() => setActiveTab("analyzer")} className={getTabClass("analyzer", "text-emerald-400 border-emerald-500")}>
              <Folder className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="flex-1 text-left">Analisi Progetto</span>
              <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-mono font-bold border border-emerald-900/60 px-1.5 py-0.2 rounded">AI</span>
            </button>
            <button onClick={() => setActiveTab("media")} className={getTabClass("media", "text-white border-emerald-500")}>
              <Wand2 className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Media Generation Lab</span>
            </button>
            <button onClick={() => setActiveTab("guide")} className={getTabClass("guide", "text-white border-emerald-500")}>
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-violet-400" />
              <span>Guida all'Uso</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="pt-4 mt-6 border-t border-zinc-850 text-[11px] text-zinc-500 space-y-2 bg-emerald-950/5 p-3 rounded" id="sidebar-footer">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">System Assistant</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        </div>
        <p className="text-[11px] text-zinc-400 leading-tight italic">
          "Switching to Llama-3-8B-Q4_K_M for optimal 8GB RAM performance."
        </p>
      </div>
    </aside>
  );
}
