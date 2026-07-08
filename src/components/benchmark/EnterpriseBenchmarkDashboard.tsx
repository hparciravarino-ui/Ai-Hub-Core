import React, { useState, useEffect } from "react";
import { 
  BarChart, Activity, Cpu, Zap, Settings, Shield, Server,
  CheckCircle, AlertTriangle, Play, Database, History, TrendingUp 
} from "lucide-react";
import { BenchmarkCore } from "../../core/benchmark/BenchmarkCore";
import { DashboardProvider } from "../../core/benchmark/DashboardProvider";
import { Model } from "../../types";

interface Props {
  models: Model[];
}

export default function EnterpriseBenchmarkDashboard({ models }: Props) {
  const [results, setResults] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await DashboardProvider.getDashboardData();
      setResults(data.history);
      setRankings(data.rankings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runBenchmark = async (modelId: string, modelName: string) => {
    setRunning(modelId);
    try {
      // Default to Ollama for local models. Could add a selector in a real app.
      await BenchmarkCore.executeBenchmarkSuite(modelId, modelName, "ollama");
      await loadResults();
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <Activity className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <span className="font-mono text-sm">Caricamento Benchmark Engine...</span>
      </div>
    );
  }

  const downloadedModels = models.filter(m => m.downloaded);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Enterprise Benchmark Engine
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">Misurazioni Reali Hardware & Modelli AI Locali</p>
        </div>
        <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[11px] font-mono text-zinc-300 flex items-center">
          <Database className="w-3 h-3 mr-1.5 text-emerald-400" />
          Test Eseguiti: {results.length}
        </div>
      </div>

      
      {rankings && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center mb-4">
            <TrendingUp className="w-4 h-4 mr-1.5 text-zinc-500" />
            Classifiche Globali
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Più Veloce</div>
              <div className="text-sm font-bold text-emerald-400 truncate">{rankings.fastest?.modelName || 'N/D'}</div>
              <div className="text-xs text-zinc-400 font-mono">{rankings.fastest?.metrics.tokensPerSecond} t/s</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Più Stabile (Basso CPU)</div>
              <div className="text-sm font-bold text-blue-400 truncate">{rankings.mostStable?.modelName || 'N/D'}</div>
              <div className="text-xs text-zinc-400 font-mono">Picco {rankings.mostStable?.metrics.cpuPeak.toFixed(1)}%</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Miglior Efficienza</div>
              <div className="text-sm font-bold text-purple-400 truncate">{rankings.bestEfficiency?.modelName || 'N/D'}</div>
              <div className="text-xs text-zinc-400 font-mono">Ottimo rapporto t/s per RAM</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Miglior Offline</div>
              <div className="text-sm font-bold text-amber-400 truncate">{rankings.bestOffline?.modelName || 'N/D'}</div>
              <div className="text-xs text-zinc-400 font-mono">Consigliato dal sistema</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center">
            <Play className="w-4 h-4 mr-1.5 text-zinc-500" />
            Esegui Benchmark
          </h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            {downloadedModels.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono">Nessun modello locale scaricato. Scarica un modello dal Model Manager per testarlo.</p>
            ) : (
              <ul className="space-y-2">
                {downloadedModels.map(m => (
                  <li key={m.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded">
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">{m.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{m.id}</div>
                    </div>
                    <button 
                      onClick={() => runBenchmark(m.id, m.name)}
                      disabled={running !== null}
                      className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center ${
                        running === m.id 
                          ? "bg-blue-900/50 text-blue-400 border border-blue-800 cursor-wait" 
                          : "bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900"
                      }`}
                    >
                      {running === m.id ? (
                        <><Activity className="w-3 h-3 mr-1.5 animate-spin" /> In corso...</>
                      ) : (
                        <><Play className="w-3 h-3 mr-1.5" /> Start</>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center">
            <History className="w-4 h-4 mr-1.5 text-zinc-500" />
            Risultati Recenti
          </h3>
          <div className="space-y-3">
            {results.slice().reverse().slice(0, 5).map((r, idx) => (
              <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">{r.modelName}</h4>
                    <div className="text-[10px] text-zinc-500 font-mono">{new Date(r.timestamp).toLocaleString()} • {r.provider}</div>
                  </div>
                  {r.status === 'completed' ? (
                    <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] rounded uppercase font-bold">Completato</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-950 border border-red-800 text-red-400 text-[10px] rounded uppercase font-bold">Fallito</span>
                  )}
                </div>

                {r.status === 'completed' ? (
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-zinc-950 p-2 border border-zinc-800 rounded">
                      <span className="text-zinc-500 block mb-1">Velocità</span>
                      <span className="text-blue-400 font-bold">{r.metrics.tokensPerSecond} t/s</span>
                    </div>
                    <div className="bg-zinc-950 p-2 border border-zinc-800 rounded">
                      <span className="text-zinc-500 block mb-1">Time to 1st Token</span>
                      <span className="text-zinc-300">{r.metrics.timeToFirstTokenMs} ms</span>
                    </div>
                    <div className="bg-zinc-950 p-2 border border-zinc-800 rounded">
                      <span className="text-zinc-500 block mb-1">CPU Peak</span>
                      <span className="text-amber-400">{r.metrics.cpuPeak.toFixed(1)}%</span>
                    </div>
                    <div className="bg-zinc-950 p-2 border border-zinc-800 rounded">
                      <span className="text-zinc-500 block mb-1">RAM Peak</span>
                      <span className="text-amber-400">{r.metrics.ramPeak.toFixed(1)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-red-400 font-mono p-2 bg-red-950/20 border border-red-900/30 rounded">
                    {r.error}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
                  {r.analysis.map((msg, i) => (
                    <div key={i} className="flex items-center text-[11px] text-zinc-400 font-mono">
                      <Activity className="w-3 h-3 mr-1.5 text-blue-500 shrink-0" />
                      {msg}
                    </div>
                  ))}
                  {r.recommendations.map((msg, i) => (
                    <div key={i} className="flex items-center text-[11px] text-zinc-300 font-mono bg-zinc-800/30 p-1.5 rounded">
                      <Zap className="w-3 h-3 mr-1.5 text-yellow-500 shrink-0" />
                      {msg}
                    </div>
                  ))}
                </div>

              </div>
            ))}
            {results.length === 0 && (
              <div className="text-xs text-zinc-500 font-mono p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                Nessun benchmark registrato.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
