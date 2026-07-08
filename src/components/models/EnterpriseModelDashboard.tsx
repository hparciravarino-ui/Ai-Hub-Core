import React, { useState, useEffect } from "react";
import { 
  Box, Download, Activity, Cpu, Settings, Shield, Server,
  CheckCircle, AlertTriangle, Play, Database, History, TrendingUp, Search, Sliders
} from "lucide-react";
import { ModelService } from "../../core/services/ModelService";
import { Model } from "../../types";
import { SectionHeader } from "../ui/SectionHeader";
import { Card, CardContent } from "../ui/Card";

interface Props {
  models: Model[];
}

export default function EnterpriseModelDashboard({ models }: Props) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'installed' | 'updates'>('catalog');
  const [installing, setInstalling] = useState<string | null>(null);
  const [rankings, setRankings] = useState<any>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const data = await ModelService.getRankings();
      setRankings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInstall = async (model: Model) => {
    setInstalling(model.id);
    try {
      await ModelService.installModel(model);
      // Let parent component know somehow? For now just visual fake
      setTimeout(() => {
        setInstalling(null);
        alert(`Model ${model.name} installed successfully!`);
      }, 3000);
    } catch (e) {
      console.error(e);
      setInstalling(null);
    }
  };

  const downloadedModels = models.filter(m => m.downloaded);
  const catalogModels = models.filter(m => !m.downloaded);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
      <SectionHeader 
        title="Enterprise Model Manager" 
        description="Gestione Centralizzata Modelli & Installazione Smart"
        icon={<Box className="w-5 h-5 text-indigo-500" />}
      />

      {rankings && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-3">
              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Miglior Coding</div>
              <div className="text-sm font-bold text-emerald-400 truncate">{rankings.bestCoding}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Miglior Reasoning</div>
              <div className="text-sm font-bold text-blue-400 truncate">{rankings.bestReasoning}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Ottimale per Hardware</div>
              <div className="text-sm font-bold text-purple-400 truncate">{rankings.bestForHardware}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Miglior Chat</div>
              <div className="text-sm font-bold text-amber-400 truncate">{rankings.bestChat}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex space-x-4 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-2 px-1 text-sm font-medium ${
            activeTab === 'catalog' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Catalogo Completo
        </button>
        <button
          onClick={() => setActiveTab('installed')}
          className={`pb-2 px-1 text-sm font-medium ${
            activeTab === 'installed' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Modelli Installati ({downloadedModels.length})
        </button>
      </div>

      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {catalogModels.map(m => (
            <div key={m.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-zinc-200">{m.name}</h3>
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded uppercase font-bold">{m.type}</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4 h-8">{m.description}</p>
                <div className="flex space-x-2 text-[10px] font-mono text-zinc-500 mb-4">
                  <span className="bg-zinc-950 px-1.5 py-0.5 rounded">Tag: {m.tags?.join(', ')}</span>
                  {m.sizeBytes && <span className="bg-zinc-950 px-1.5 py-0.5 rounded">{(m.sizeBytes / 1000000000).toFixed(1)} GB</span>}
                </div>
              </div>
              <button 
                onClick={() => handleInstall(m)}
                disabled={installing !== null}
                className={`w-full py-2 rounded text-xs font-mono font-bold transition-all flex items-center justify-center ${
                  installing === m.id 
                    ? "bg-indigo-900/50 text-indigo-400 border border-indigo-800 cursor-wait" 
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                {installing === m.id ? (
                  <><Activity className="w-4 h-4 mr-2 animate-spin" /> Auto-Configurazione in corso...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Smart Install</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'installed' && (
        <div className="space-y-4">
          {downloadedModels.length === 0 ? (
            <div className="text-center text-zinc-500 font-mono py-8">Nessun modello installato.</div>
          ) : (
            downloadedModels.map(m => (
              <div key={m.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-200">{m.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono">Modello pronto e configurato per l'hardware corrente.</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
