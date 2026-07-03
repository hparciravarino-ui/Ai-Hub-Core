import React, { useState, useEffect } from "react";
import { Server, Activity, CheckCircle, AlertTriangle, Layers, Database, Cpu, Blocks } from "lucide-react";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (e) {
        console.error("Dashboard API error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-zinc-400 p-8">Connessione al Core Engine...</div>;
  }

  const isOnline = dashboardData?.status === "online";
  const sys = dashboardData?.systemStatus;

  return (
    <div className="space-y-6" id="dashboard-tab">
      <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Stato del Core Engine (Fase 18)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className={`w-6 h-6 ${isOnline ? "text-emerald-500" : "text-red-500"}`} />
              <div>
                <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Connessione Backend</div>
                <div className={`text-sm font-semibold ${isOnline ? "text-emerald-400" : "text-red-400"}`}>
                  {isOnline ? "ONLINE" : "OFFLINE"}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center gap-3">
            <Activity className="w-6 h-6 text-sky-400" />
            <div>
              <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Versione Core</div>
              <div className="text-sm font-semibold text-sky-400">
                {sys?.version || "N/A"}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center gap-3">
            <Layers className="w-6 h-6 text-violet-400" />
            <div>
              <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Moduli Inizializzati</div>
              <div className="text-sm font-semibold text-violet-400">
                {dashboardData?.activeModules || 0}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center gap-3">
            <Database className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Database Status</div>
              <div className="text-sm font-semibold text-amber-400">
                {dashboardData?.database?.status === "connected" ? "CONNESSO" : "DISCONNESSO"}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center gap-3">
            <Cpu className="w-6 h-6 text-rose-400" />
            <div>
              <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Memoria Virtuale</div>
              <div className="text-sm font-semibold text-rose-400">
                {dashboardData?.memory?.status || "N/A"}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center gap-3">
            <Blocks className="w-6 h-6 text-fuchsia-400" />
            <div>
              <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Motore Plugin</div>
              <div className="text-sm font-semibold text-fuchsia-400">
                {dashboardData?.plugins?.status || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-12 border border-dashed border-zinc-800 rounded-xl text-center bg-[#0a0a0a]/50">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4 opacity-80" />
        <h3 className="text-lg font-medium text-zinc-300">Telemetria Hardware in Tempo Reale Non Ancora Disponibile</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
          In ottemperanza alle direttive SRS Enterprise, la simulazione fittizia dei grafici di carico CPU/GPU è stata rimossa. La dashboard ora legge i dati reali dall'endpoint /api/dashboard.
        </p>
      </div>
    </div>
  );
}
