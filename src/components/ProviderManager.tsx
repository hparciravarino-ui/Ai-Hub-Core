import React, { useState, useEffect } from "react";
import { Server, Key, Globe, Shield, RefreshCw, Plus, CheckCircle, XCircle, AlertTriangle, Play, Pause, Trash2, Edit3, Settings, EyeOff, Activity, Box, Lock, Clock, Network, Copy, UploadCloud, DownloadCloud } from "lucide-react";

interface ModelConfig {
  id: string;
  name: string;
  context: number;
  multimodal: boolean;
  vision: boolean;
  reasoning: boolean;
  functionCalling: boolean;
  embedding: boolean;
  streaming: boolean;
  cost: string;
}

interface Provider {
  id: string;
  name: string;
  status: "active" | "inactive" | "offline" | "unconfigured" | "error";
  priority: "primary" | "secondary" | "tertiary" | "none";
  encryptedKey: string;
  baseUrl?: string;
  version?: string;
  models: ModelConfig[];
  latencyMs: number | null;
  quota: string | null;
  lastChecked: string | null;
  usageCount: number;
}

export function ProviderManager() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [editKey, setEditKey] = useState("");
  const [editBaseUrl, setEditBaseUrl] = useState("");
  const [editPriority, setEditPriority] = useState<string>("none");

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/providers");
      const data = await res.json();
      setProviders(data);
      if (selectedProvider) {
        setSelectedProvider(data.find((p: Provider) => p.id === selectedProvider.id) || null);
      }
    } catch (e) {
      console.error("Failed to fetch providers", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string) => {
    try {
      await fetch(`/api/providers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: editKey,
          baseUrl: editBaseUrl,
          priority: editPriority
        })
      });
      setIsEditing(false);
      setEditKey("");
      fetchProviders();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this provider config?")) return;
    try {
      await fetch(`/api/providers/${id}`, { method: "DELETE" });
      setSelectedProvider(null);
      fetchProviders();
    } catch (e) {}
  };

  const handleVerify = async (id: string) => {
    try {
      await fetch(`/api/providers/${id}/verify`, { method: "POST" });
      fetchProviders();
    } catch (e) {}
  };

  const handleToggle = async (id: string) => {
    try {
      await fetch(`/api/providers/${id}/toggle`, { method: "POST" });
      fetchProviders();
    } catch (e) {}
  };

  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    inactive: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    offline: "bg-red-500/10 text-red-400 border-red-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    unconfigured: "bg-zinc-800 text-zinc-500 border-zinc-700",
  };

  const activeCount = providers.filter(p => p.status === "active").length;
  const unconfiguredCount = providers.filter(p => p.status === "unconfigured").length;
  const errorCount = providers.filter(p => p.status === "error" || p.status === "offline").length;

  return (
    <div className="flex flex-col h-full bg-[#030303] text-zinc-300 rounded-lg border border-zinc-800/50 overflow-hidden" id="provider-manager">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">AI Provider Fleet Management</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">Gestione centralizzata API Key e bilanciamento carichi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs flex items-center gap-2 transition-colors">
            <UploadCloud className="w-3.5 h-3.5" /> Import
          </button>
          <button className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs flex items-center gap-2 transition-colors">
            <DownloadCloud className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-800 border-b border-zinc-800">
        <div className="bg-zinc-950 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Totale Provider</div>
            <div className="text-xl font-mono text-zinc-100 mt-1">{providers.length}</div>
          </div>
          <Server className="w-6 h-6 text-zinc-700" />
        </div>
        <div className="bg-zinc-950 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Attivi (Pronti)</div>
            <div className="text-xl font-mono text-emerald-400 mt-1">{activeCount}</div>
          </div>
          <CheckCircle className="w-6 h-6 text-emerald-500/20" />
        </div>
        <div className="bg-zinc-950 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Errori / Offline</div>
            <div className="text-xl font-mono text-red-400 mt-1">{errorCount}</div>
          </div>
          <AlertTriangle className="w-6 h-6 text-red-500/20" />
        </div>
        <div className="bg-zinc-950 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Da Configurare</div>
            <div className="text-xl font-mono text-zinc-400 mt-1">{unconfiguredCount}</div>
          </div>
          <Box className="w-6 h-6 text-zinc-800" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Providers List */}
        <div className="w-1/3 border-r border-zinc-800 bg-zinc-950/50 flex flex-col custom-scrollbar overflow-y-auto">
          {providers.map(p => (
            <div 
              key={p.id}
              onClick={() => { setSelectedProvider(p); setIsEditing(false); }}
              className={`p-3 border-b border-zinc-800/50 cursor-pointer transition-colors ${selectedProvider?.id === p.id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'hover:bg-zinc-900'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-zinc-200">{p.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-mono ${statusColors[p.status]}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <div className="flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  <span className="font-mono">{p.encryptedKey ? "Cifrata in KMS" : "Nessuna Key"}</span>
                </div>
                {p.latencyMs && (
                  <span className="flex items-center gap-1 font-mono">
                    <Activity className="w-3 h-3 text-emerald-500" />
                    {p.latencyMs}ms
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Content - Details */}
        <div className="w-2/3 bg-zinc-950 flex flex-col overflow-y-auto custom-scrollbar">
          {selectedProvider ? (
            <div className="p-6 space-y-6">
              {/* Header Details */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    {selectedProvider.name}
                    {selectedProvider.priority !== 'none' && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {selectedProvider.priority}
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-500" /> OWASP Compliant</span>
                    <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-emerald-500" /> Backend-Only</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(selectedProvider.id)} className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-zinc-400 transition-colors" title="Verifica Connessione">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggle(selectedProvider.id)} className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-zinc-400 transition-colors" title="Attiva/Disattiva">
                    {selectedProvider.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(selectedProvider.id)} className="p-2 bg-zinc-900 hover:bg-red-900/30 border border-zinc-700 hover:border-red-500/50 hover:text-red-400 rounded text-zinc-400 transition-colors" title="Elimina Configurazione">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Config Section */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Credenziali e Routing</h4>
                  {!isEditing && (
                    <button onClick={() => {
                      setIsEditing(true);
                      setEditBaseUrl(selectedProvider.baseUrl || "");
                      setEditPriority(selectedProvider.priority);
                      setEditKey("");
                    }} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Modifica
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">API Key (Cifrata a riposo)</label>
                      <input 
                        type="password" 
                        value={editKey} 
                        onChange={e => setEditKey(e.target.value)} 
                        placeholder={selectedProvider.encryptedKey ? "Inserisci nuova key per sovrascrivere..." : "sk-..."}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">Base URL (Opzionale)</label>
                        <input 
                          type="text" 
                          value={editBaseUrl} 
                          onChange={e => setEditBaseUrl(e.target.value)} 
                          placeholder="https://api..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">Priorità Fallback</label>
                        <select 
                          value={editPriority} 
                          onChange={e => setEditPriority(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="none">Nessuna</option>
                          <option value="primary">Primario</option>
                          <option value="secondary">Secondario</option>
                          <option value="tertiary">Terziario</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">Annulla</button>
                      <button onClick={() => handleSave(selectedProvider.id)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold">Salva Configurazione</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                      <span className="text-xs text-zinc-500">API Key</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                          {selectedProvider.encryptedKey || "Non configurata"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                      <span className="text-xs text-zinc-500">Base URL Override</span>
                      <span className="text-xs text-zinc-300">{selectedProvider.baseUrl || "Default"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-zinc-500">Ultimo Controllo</span>
                      <span className="text-xs text-zinc-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {selectedProvider.lastChecked ? new Date(selectedProvider.lastChecked).toLocaleString() : "Mai"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Models Section */}
              {selectedProvider.models.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Modelli Disponibili</h4>
                  <div className="space-y-2">
                    {selectedProvider.models.map(m => (
                      <div key={m.id} className="bg-zinc-900/40 border border-zinc-800/60 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-zinc-200">{m.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{m.cost}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">Ctx: {m.context / 1000}k</span>
                          {m.multimodal && <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded">Multimodal</span>}
                          {m.vision && <span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-400 rounded">Vision</span>}
                          {m.reasoning && <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded">Reasoning</span>}
                          {m.functionCalling && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">Tools</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Network className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Seleziona un provider dalla lista per gestirlo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
