import React, { useState, useEffect } from "react";
import { 
  Server, Cpu, Database, Zap, Activity, CheckCircle, AlertTriangle, Play, BrainCircuit, Box, Shield, 
  BarChart, Target, Star, HardDrive, Terminal
} from "lucide-react";
import { HardwareProfile } from "../types";

export default function IntelligenceEngine() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch("/api/models/evaluate");
        if (!res.ok) throw new Error("API fallita");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
        <Activity className="w-8 h-8 animate-spin text-blue-400 mb-4" />
        <p className="font-mono text-sm">Inizializzazione Hardware Intelligence Engine...</p>
        <p className="text-xs text-zinc-500 mt-2">Analisi CPU, GPU, RAM e Runtime in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950 border border-red-800 rounded-lg text-red-400 font-mono text-sm">
        <AlertTriangle className="w-6 h-6 mb-2" />
        Errore di analisi: {error}
      </div>
    );
  }

  const { hardwareProfile, recommendations, models } = data;

  const renderRecommendedCard = (title: string, model: any, icon: React.ReactNode) => {
    if (!model) return null;
    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
        <div className="flex items-center space-x-2 text-zinc-300 mb-2">
          {icon}
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
        <div className="font-mono text-emerald-400 text-sm mb-1">{model.name}</div>
        <div className="text-xs text-zinc-500 mb-3">{model.description?.substring(0, 80)}...</div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-zinc-500">Compatibilità:</span>
            <span className={model.compatibility.score > 80 ? 'text-emerald-400' : 'text-amber-400'}>
              {model.compatibility.score}/100
            </span>
          </div>
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-zinc-500">Prestazioni (t/s):</span>
            <span className="text-blue-400">{model.benchmark.speedText}</span>
          </div>
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-zinc-500">Threads:</span>
            <span className="text-zinc-300">{model.autoConfig.threads}</span>
          </div>
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-zinc-500">GPU Layers:</span>
            <span className="text-zinc-300">{model.autoConfig.gpuLayers}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-blue-400" />
            Hardware Intelligence Engine
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Analisi automatica e profiliazione modelli AI</p>
        </div>
        <div className="px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[11px] font-mono uppercase tracking-wider flex items-center">
          <CheckCircle className="w-3 h-3 mr-1.5" />
          Auto-Profiling Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hardware Analyzer */}
        <div className="space-y-4">
          <h3 className="text-[13px] font-bold text-zinc-300 uppercase tracking-wider flex items-center">
            <Server className="w-4 h-4 mr-1.5 text-zinc-500" />
            Hardware Rilevato
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">CPU</span>
              <span className="text-zinc-300 text-right">{hardwareProfile.cpu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">RAM Totale</span>
              <span className="text-blue-400">{hardwareProfile.ram}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">GPU Principale</span>
              <span className="text-emerald-400 text-right">{hardwareProfile.gpu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">VRAM Stimata</span>
              <span className="text-emerald-400">{hardwareProfile.vram}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">NPU / AI Core</span>
              <span className="text-purple-400">{hardwareProfile.aiAccelerators}</span>
            </div>
          </div>
        </div>

        {/* Architecture */}
        <div className="space-y-4">
          <h3 className="text-[13px] font-bold text-zinc-300 uppercase tracking-wider flex items-center">
            <Box className="w-4 h-4 mr-1.5 text-zinc-500" />
            Architettura Proposta
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
            {[
              { n: 'Hardware Analyzer', d: 'Scansione OS, CPU, Memoria' },
              { n: 'Compatibility Engine', d: 'Filtro requisiti RAM/VRAM' },
              { n: 'Scoring Engine', d: 'Valutazione contestuale' },
              { n: 'Configuration Engine', d: 'Calcolo Threads, Batch, Context' },
              { n: 'Benchmark Predictor', d: 'Stima Throughput Tokens/sec' },
              { n: 'Recommendation Engine', d: 'Assegnazione dinamica' },
            ].map(mod => (
              <div key={mod.n} className="flex items-center text-[11px] font-mono">
                <CheckCircle className="w-3 h-3 text-emerald-500 mr-2" />
                <span className="text-zinc-300 w-40">{mod.n}</span>
                <span className="text-zinc-600">{mod.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raccomandazioni */}
      <div className="mt-8">
        <h3 className="text-[13px] font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center">
          <Target className="w-4 h-4 mr-1.5 text-zinc-500" />
          Modelli Consigliati
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderRecommendedCard("Miglior Modello Coding", recommendations.bestCoding, <Terminal className="w-4 h-4 text-blue-400" />)}
          {renderRecommendedCard("Miglior Modello Chat", recommendations.bestChat, <Star className="w-4 h-4 text-amber-400" />)}
          {renderRecommendedCard("Miglior Reasoning (API)", recommendations.bestReasoning, <BrainCircuit className="w-4 h-4 text-purple-400" />)}
          {renderRecommendedCard("Miglior RAG", recommendations.bestRag, <Database className="w-4 h-4 text-emerald-400" />)}
          {renderRecommendedCard("Miglior Modello Offline", recommendations.bestOffline, <HardDrive className="w-4 h-4 text-zinc-400" />)}
          {renderRecommendedCard("Miglior Modello Leggero", recommendations.bestLightweight, <Zap className="w-4 h-4 text-yellow-400" />)}
        </div>
      </div>

      {/* Classifica Completa */}
      <div className="mt-8">
        <h3 className="text-[13px] font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center">
          <BarChart className="w-4 h-4 mr-1.5 text-zinc-500" />
          Classifica Dinamica
        </h3>
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-[11px] font-mono text-zinc-400">
            <thead className="bg-zinc-900 text-zinc-300">
              <tr>
                <th className="p-3">Modello</th>
                <th className="p-3">Score</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Compatibilità</th>
                <th className="p-3">Velocità Prevista</th>
                <th className="p-3">Configurazione Ottimale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
              {models.slice(0, 10).map((m: any, idx: number) => (
                <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-3">
                    <div className="text-zinc-200 font-semibold">{m.name}</div>
                    <div className="text-zinc-600 truncate max-w-[150px]">{m.id}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-400 border border-blue-800">
                      {m.scores.overall}/100
                    </span>
                  </td>
                  <td className="p-3 uppercase text-[10px]">{m.type}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded border ${m.compatibility.color.replace('text-', 'text-').replace('bg-', 'bg-opacity-20 ')}`}>
                      {m.compatibility.status}
                    </span>
                  </td>
                  <td className="p-3">{m.benchmark.speedText}</td>
                  <td className="p-3 text-zinc-500">
                    Thr:{m.autoConfig.threads} | Lyr:{m.autoConfig.gpuLayers} | Ctx:{m.autoConfig.contextWindow}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
