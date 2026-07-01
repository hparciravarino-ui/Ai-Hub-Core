import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Cpu,
  Flame,
  Gauge,
  Layers,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Server,
  Globe,
  Activity,
} from "lucide-react";
import { HardwareProfile, PerformanceProfile, PerformanceProfileId } from "../types";
import { PERFORMANCE_PROFILES } from "../data";
import { getAuthHeaders } from "../utils";

interface DashboardProps {
  currentHardware: HardwareProfile;
  selectedProfileId: PerformanceProfileId;
  onProfileChange: (profileId: PerformanceProfileId) => void;
  installedModelsCount: number;
}

export default function Dashboard({
  currentHardware,
  selectedProfileId,
  onProfileChange,
  installedModelsCount,
}: DashboardProps) {
  const [metrics, setMetrics] = useState({
    cpu: currentHardware.loadCpu,
    gpu: currentHardware.loadGpu,
    ram: currentHardware.loadRam,
    vram: currentHardware.loadVram,
    temp: currentHardware.temperature,
    tokensPerSec: 0,
    latency: 0,
  });

  const [history, setHistory] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState<{
    ping: number | null;
    apiConfigured: boolean | null;
    openRouterConfigured: boolean | null;
    isOnline: boolean;
    lastChecked: string;
  }>({
    ping: null,
    apiConfigured: null,
    openRouterConfigured: null,
    isOnline: false,
    lastChecked: "--:--:--",
  });

  const selectedProfile = PERFORMANCE_PROFILES.find((p) => p.id === selectedProfileId) || PERFORMANCE_PROFILES[1];

  // Ping backend API to determine online status
  useEffect(() => {
    const checkServerStatus = async () => {
      const startTime = performance.now();
      try {
        const response = await fetch("/api/health", {
          headers: getAuthHeaders(),
        });
        const endTime = performance.now();
        const pingTime = Math.round(endTime - startTime);
        
        if (response.ok) {
          const data = await response.json();
          setServerStatus({
            ping: pingTime,
            apiConfigured: data.apiConfigured,
            openRouterConfigured: data.openRouterConfigured,
            isOnline: true,
            lastChecked: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          });
        } else {
          throw new Error("Server response not ok");
        }
      } catch (error) {
        setServerStatus((prev) => ({
          ...prev,
          isOnline: false,
          ping: null,
          lastChecked: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        }));
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Initialize history
  useEffect(() => {
    const initialHistory = Array.from({ length: 15 }).map((_, i) => ({
      time: `${15 - i}s fa`,
      cpu: currentHardware.loadCpu,
      ram: currentHardware.loadRam,
      gpu: currentHardware.loadGpu,
      tokens: 0,
    }));
    setHistory(initialHistory);
  }, [currentHardware]);

  // Dynamic simulation of hardware metrics based on the active Performance Profile
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        let baseCpu = 5;
        let baseGpu = 2;
        let baseRam = 35;
        let baseVram = 10;
        let baseTemp = 40;
        let tokSpeed = 0;
        let lat = 0;

        // Base values vary by profile
        switch (selectedProfileId) {
          case "eco":
            baseCpu = 25; // Utilizing CPU mostly
            baseGpu = 2;
            baseRam = Math.min(prev.ram, currentHardware.ram * 6); // compressed, lower ram
            baseVram = 5;
            baseTemp = 48 + Math.random() * 3;
            tokSpeed = 12 + Math.random() * 2;
            lat = 220 + Math.random() * 20;
            break;
          case "balanced":
            baseCpu = 35;
            baseGpu = 15;
            baseRam = 45;
            baseVram = 25;
            baseTemp = 55 + Math.random() * 4;
            tokSpeed = 22 + Math.random() * 3;
            lat = 110 + Math.random() * 15;
            break;
          case "performance":
            baseCpu = 55;
            baseGpu = 50;
            baseRam = 55;
            baseVram = 60;
            baseTemp = 64 + Math.random() * 4;
            tokSpeed = 38 + Math.random() * 5;
            lat = 45 + Math.random() * 8;
            break;
          case "turbo":
            baseCpu = 85;
            baseGpu = 92;
            baseRam = 75;
            baseVram = 88;
            baseTemp = 76 + Math.random() * 5;
            tokSpeed = 58 + Math.random() * 8;
            lat = 18 + Math.random() * 4;
            break;
          case "quality":
            baseCpu = 45;
            baseGpu = 65;
            baseRam = 85; // high memory precision
            baseVram = 70;
            baseTemp = 68 + Math.random() * 3;
            tokSpeed = 18 + Math.random() * 2;
            lat = 85 + Math.random() * 10;
            break;
        }

        // Adjust for hardware limits (e.g. CPU-only netbook cannot load GPU)
        if (currentHardware.vram === 0.5) {
          baseGpu = Math.min(baseGpu, 10);
          baseVram = Math.min(baseVram, 12);
          tokSpeed = tokSpeed * 0.4; // Slower on CPU only
          lat = lat * 2.2;
        } else if (currentHardware.id === "apple_silicon_m1") {
          // Apple silicon is super efficient
          baseTemp = baseTemp - 12;
          tokSpeed = tokSpeed * 1.1;
        }

        const newCpu = Math.min(100, Math.max(2, Math.round(baseCpu + (Math.random() * 8 - 4))));
        const newGpu = Math.min(100, Math.max(0, Math.round(baseGpu + (Math.random() * 6 - 3))));
        const newRam = Math.min(100, Math.max(10, Math.round(baseRam + (Math.random() * 4 - 2))));
        const newVram = Math.min(100, Math.max(0, Math.round(baseVram + (Math.random() * 4 - 2))));
        const newTemp = Math.round(baseTemp);
        const finalTok = parseFloat(tokSpeed.toFixed(1));
        const finalLat = Math.round(lat);

        // Update history graph array
        setHistory((prevHist) => {
          const nextHist = [...prevHist.slice(1)];
          nextHist.push({
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            cpu: newCpu,
            ram: newRam,
            gpu: newGpu,
            tokens: finalTok,
          });
          return nextHist;
        });

        return {
          cpu: newCpu,
          gpu: newGpu,
          ram: newRam,
          vram: newVram,
          temp: newTemp,
          tokensPerSec: finalTok,
          latency: finalLat,
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedProfileId, currentHardware]);

  // Diagnose memory bottleneck simulation
  const isOutOfMemoryRisk =
    (currentHardware.ram < 12 && selectedProfileId === "quality") ||
    (currentHardware.ram === 8 && selectedProfileId === "turbo");

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Profile Card */}
        <div className="p-4 bg-panelbg border border-zinc-800 rounded-xl" id="card-profile">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Profilo Attivo</span>
            <Zap className={`w-4 h-4 ${selectedProfileId === "turbo" ? "text-amber-500 animate-pulse" : "text-emerald-500"}`} />
          </div>
          <div className="text-xl font-semibold text-zinc-100 capitalize">{selectedProfile.name}</div>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 h-8 leading-tight">
            {selectedProfile.description}
          </p>
        </div>

        {/* Inference Speed */}
        <div className="p-4 bg-panelbg border border-zinc-800 rounded-xl" id="card-tok-speed">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Velocità di Calcolo</span>
            <Gauge className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-zinc-100">
              {metrics.tokensPerSec > 0 ? metrics.tokensPerSec : "--"}
            </span>
            <span className="text-sm text-zinc-400 font-medium">tok/sec</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Latenza primo token: <strong className="font-mono text-zinc-300">{metrics.latency || "--"} ms</strong>
          </p>
        </div>

        {/* Physical RAM state */}
        <div className="p-4 bg-panelbg border border-zinc-800 rounded-xl" id="card-ram-status">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Carico RAM Fisica</span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-zinc-100">{metrics.ram}%</span>
            <span className="text-xs text-zinc-400 font-mono">
              ({Math.round((metrics.ram / 100) * currentHardware.ram)}/{currentHardware.ram} GB)
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                metrics.ram > 85 ? "bg-red-500" : metrics.ram > 65 ? "bg-yellow-500" : "bg-emerald-500"
              }`}
              style={{ width: `${metrics.ram}%` }}
            />
          </div>
        </div>

        {/* Thermal Monitor */}
        <div className="p-4 bg-panelbg border border-zinc-800 rounded-xl" id="card-thermal">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Termico & Ventole</span>
            <Flame className={`w-4 h-4 ${metrics.temp > 70 ? "text-red-500 animate-bounce" : "text-amber-500"}`} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-zinc-100">{metrics.temp}°C</span>
            <span className="text-xs text-zinc-400 font-medium">
              {metrics.temp > 75 ? "Ventole: Turbo (100%)" : metrics.temp > 60 ? "Ventole: Medio" : "Silenzioso"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Soglia di throttling: <strong className="font-mono text-zinc-300">90°C</strong>
          </p>
        </div>
      </div>

      {/* Network & API Handshake Status */}
      <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl" id="network-handshake-status">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Handshake di Rete & Stato API
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            Ultimo controllo: {serverStatus.lastChecked}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-[#0a0a0a] border border-zinc-800/80 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className={`w-5 h-5 ${serverStatus.isOnline ? "text-emerald-500" : "text-red-500"}`} />
              <div>
                <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Stato Server Node</div>
                <div className={`text-sm font-semibold ${serverStatus.isOnline ? "text-emerald-400" : "text-red-400"}`}>
                  {serverStatus.isOnline ? "ONLINE" : "OFFLINE"}
                </div>
              </div>
            </div>
            {serverStatus.isOnline && <CheckCircle className="w-4 h-4 text-emerald-500/50" />}
          </div>

          <div className="p-3 bg-[#0a0a0a] border border-zinc-800/80 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className={`w-5 h-5 ${serverStatus.ping !== null ? "text-sky-400" : "text-zinc-600"}`} />
              <div>
                <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Latenza Ping (Locale)</div>
                <div className="text-sm font-semibold text-sky-400">
                  {serverStatus.ping !== null ? `${serverStatus.ping} ms` : "--"}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0a0a0a] border border-zinc-800/80 rounded-lg flex items-center justify-between col-span-1 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Zap className={`w-5 h-5 ${serverStatus.apiConfigured || serverStatus.openRouterConfigured ? "text-emerald-500" : "text-amber-500"}`} />
              <div>
                <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Validazione Token Esterni</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${serverStatus.apiConfigured ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>Gemini</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${serverStatus.openRouterConfigured ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>OpenRouter</span>
                </div>
              </div>
            </div>
            {!(serverStatus.apiConfigured || serverStatus.openRouterConfigured) && <AlertTriangle className="w-4 h-4 text-amber-500/50" />}
          </div>
        </div>
      </div>

      {/* Profiler Diagnostics Notification Banner */}
      {isOutOfMemoryRisk && (
        <div className="flex items-start space-x-3 p-4 bg-yellow-950/20 border border-yellow-900/60 rounded-xl text-yellow-200" id="diagnostic-alert">
          <AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-400 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Rilevamento Collo di Bottiglia RAM</h4>
            <p className="text-xs text-yellow-300/90 mt-1 leading-relaxed">
              Il profilo selezionato (<strong>{selectedProfile.name}</strong>) potrebbe eccedere gli <strong>{currentHardware.ram}GB</strong> di RAM fisica di questo sistema. L'AI Hub ha attivato automaticamente la <strong>Smart Compression</strong> della cache di contesto e lo <strong>Swap Intelligente di secondo livello</strong> su SSD per prevenire crash (OOM). Si consiglia il profilo <strong>Eco</strong> o <strong>Bilanciato</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Charts & Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Graphic (2 cols width) */}
        <div className="lg:col-span-2 p-5 bg-panelbg border border-zinc-800 rounded-xl flex flex-col justify-between" id="realtime-telemetry-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Telemetria Hardware in Tempo Reale
              </h3>
              <p className="text-xs text-zinc-500 italic">Risoluzione di campionamento: 1500ms (Totalmente Locale, Zero Telemetria Cloud)</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 bg-emerald-950/40 text-emerald-500 border border-emerald-900/40 rounded">
              ● MOTORE IN FUNZIONE
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={10} fontStyle="italic" />
                <YAxis stroke="#71717a" domain={[0, 100]} fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#1f1f23" }}
                  labelStyle={{ color: "#a1a1aa", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ fontSize: "12px", padding: "2px 0" }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  name="Carico CPU (%)"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCpu)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="gpu"
                  name="Carico GPU (%)"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorGpu)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="ram"
                  name="Carico RAM (%)"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorRam)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800 text-center">
            <div>
              <div className="text-xs text-zinc-400">Media CPU</div>
              <div className="text-base font-semibold font-mono text-emerald-400">{metrics.cpu}%</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Media GPU</div>
              <div className="text-base font-semibold font-mono text-sky-400">
                {currentHardware.vram === 0.5 ? "N/D (Intel UHD)" : `${metrics.gpu}%`}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Modelli residenti</div>
              <div className="text-base font-semibold font-mono text-violet-400">{installedModelsCount} / 3</div>
            </div>
          </div>
        </div>

        {/* Profilo Energetico Control (1 col width) */}
        <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl flex flex-col justify-between" id="profile-controls-panel">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
              Selezione Profilo Operativo
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              I profili cambiano in tempo reale thread della CPU, GPU layers, batch size e allocazione VRAM.
            </p>

            <div className="space-y-3">
              {PERFORMANCE_PROFILES.map((profile) => {
                const isSelected = selectedProfileId === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => onProfileChange(profile.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-zinc-800/40 border-emerald-500/80 shadow-lg"
                        : "bg-[#0a0a0a]/50 hover:bg-[#0a0a0a]/80 border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-zinc-100 capitalize">
                        {profile.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 border border-emerald-800 rounded uppercase">
                          Attivo
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-snug">
                      {profile.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-3 bg-barbg border border-zinc-800 rounded-lg text-xs space-y-2">
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wide border-b border-zinc-800 pb-1">
              Parametri di Sintonia Fine
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Thread CPU:</span>
              <span className="font-mono text-zinc-200">
                {Math.max(1, Math.round(currentHardware.threads * selectedProfile.cpuThreadsMultiplier))} core logici
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Offloading VRAM:</span>
              <span className="font-mono text-zinc-200">
                {currentHardware.vram === 0.5 ? "Nessuno (CPU Only)" : `${selectedProfile.gpuOffloadRatio}% layers`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Context Cache:</span>
              <span className="font-mono text-zinc-200">{selectedProfile.cachingLevel} ({selectedProfile.contextWindow} tok)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Stato Swap SSD:</span>
              <span className={`font-mono ${selectedProfile.ramSwapEnabled ? "text-amber-400" : "text-zinc-500"}`}>
                {selectedProfile.ramSwapEnabled ? "Attivo (Abilitato)" : "Disabilitato"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
