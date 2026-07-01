import React, { useState } from "react";
import {
  Cpu,
  Monitor,
  HardDrive,
  Activity,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { HardwareProfile, PerformanceProfileId } from "../types";
import { HARDWARE_PRESETS } from "../data";

interface OptimizerProps {
  currentHardware: HardwareProfile;
  selectedHardwareId: string;
  onHardwareChange: (hardwareId: string) => void;
  selectedProfileId: PerformanceProfileId;
  onDiagnose: () => void;
  diagnosticsText: string;
  isDiagnosing: boolean;
  onCustomHardwareUpdate?: (profile: HardwareProfile) => void;
}

export default function Optimizer({
  currentHardware,
  selectedHardwareId,
  onHardwareChange,
  selectedProfileId,
  onDiagnose,
  diagnosticsText,
  isDiagnosing,
  onCustomHardwareUpdate,
}: OptimizerProps) {
  const [benchmarkActive, setBenchmarkActive] = useState(false);
  const [benchmarkStep, setBenchmarkStep] = useState("");
  const [benchmarkScores, setBenchmarkScores] = useState<any | null>(null);

  // Hardware Selection Tab: "predefined" | "manual"
  const [hardwareTab, setHardwareTab] = useState<"predefined" | "manual">("predefined");

  // Form states for custom manual input, prefilled with a solid default
  const [customName, setCustomName] = useState("Il Mio Computer Personale");
  const [customCpu, setCustomCpu] = useState("Intel Core i7 Gen_13");
  const [customGpu, setCustomGpu] = useState("NVIDIA RTX 4060");
  const [customRam, setCustomRam] = useState(16);
  const [customVram, setCustomVram] = useState(8);
  const [customCores, setCustomCores] = useState(8);
  const [customThreads, setCustomThreads] = useState(16);
  const [customStorage, setCustomStorage] = useState<"SSD" | "HDD">("SSD");
  const [customFreeSpace, setCustomFreeSpace] = useState(120);

  // Installation Simulation States
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStep, setInstallStep] = useState("");

  const loadCurrentIntoForm = () => {
    setCustomName(currentHardware.id === "custom" ? currentHardware.name : "Il Mio PC Personalizzato");
    setCustomCpu(currentHardware.cpu);
    setCustomGpu(currentHardware.gpu);
    setCustomRam(currentHardware.ram);
    setCustomVram(currentHardware.vram);
    setCustomCores(currentHardware.cores);
    setCustomThreads(currentHardware.threads);
    setCustomStorage(currentHardware.storageType);
    setCustomFreeSpace(currentHardware.freeSpace);
  };

  const handleSaveCustomHardware = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCustomHardwareUpdate) return;

    const customProfile: HardwareProfile = {
      id: "custom",
      name: customName,
      cpu: customCpu,
      gpu: customGpu,
      ram: Number(customRam),
      vram: Number(customVram),
      cores: Number(customCores),
      threads: Number(customThreads),
      storageType: customStorage,
      freeSpace: Number(customFreeSpace),
      temperature: 42,
      loadCpu: 8,
      loadGpu: 2,
      loadRam: 35,
      loadVram: 5,
    };

    onCustomHardwareUpdate(customProfile);
  };

  const handleStartInstallation = () => {
    setInstalling(true);
    setInstallProgress(0);
    setInstallStep("Inizializzazione controlli di idoneità hardware...");

    const steps = [
      { msg: "Allocazione dei canali di memoria RAM locale...", progress: 15, delay: 600 },
      { msg: "Configurazione della sandbox crittografata offline...", progress: 35, delay: 800 },
      { msg: "Iniezione delle librerie di accelerazione hardware (WASM/WebNN)...", progress: 60, delay: 900 },
      { msg: "Verifica compatibilità del set di istruzioni CPU...", progress: 85, delay: 700 },
      { msg: "Installazione completata! Motore AI Hub pronto per l'inferenza locale.", progress: 100, delay: 500 }
    ];

    let cumulativeDelay = 200;
    steps.forEach((step, index) => {
      setTimeout(() => {
        setInstallProgress(step.progress);
        setInstallStep(step.msg);
        if (index === steps.length - 1) {
          setInstalling(false);
          setInstalled(true);
        }
      }, cumulativeDelay);
      cumulativeDelay += step.delay;
    });
  };

  // Eligibility Checks
  const isRamEligible = currentHardware.ram >= 8;
  const isCpuEligible = currentHardware.cores >= 4;
  const isStorageEligible = currentHardware.storageType === "SSD";
  const isSpaceEligible = currentHardware.freeSpace >= 15;
  const isFullyEligible = isRamEligible && isCpuEligible && isStorageEligible && isSpaceEligible;

  // Trigger automated hardware benchmark simulator
  const runBenchmark = () => {
    setBenchmarkActive(true);
    setBenchmarkScores(null);
    
    const steps = [
      { msg: "Inizializzazione test hardware locale...", delay: 800 },
      { msg: "Misurazione larghezza di banda RAM...", delay: 1200 },
      { msg: "Rilevamento core GPU & Vulkan/Metal shader throughput...", delay: 1500 },
      { msg: "Benchmark calcolo in virgola mobile CPU (FP32/FP16)...", delay: 1500 },
      { msg: "Verifica velocità di lettura sequenziale disco...", delay: 1000 },
      { msg: "Calcolo dei punteggi finali...", delay: 500 },
    ];

    let currentDelay = 0;
    steps.forEach((step, index) => {
      setTimeout(() => {
        setBenchmarkStep(step.msg);
        if (index === steps.length - 1) {
          // Finished
          setBenchmarkActive(false);
          setBenchmarkStep("");
          
          // Generate realistic scores based on selected hardware
          let cpuScore = 1200;
          let gpuScore = 400;
          let diskScore = 90; // HDD
          let ramScore = 1500;

          if (currentHardware.id === "custom") {
            cpuScore = currentHardware.cores * 420 + currentHardware.threads * 110;
            gpuScore = currentHardware.vram > 0 ? Math.round(currentHardware.vram * 980 + 800) : 120;
            diskScore = currentHardware.storageType === "SSD" ? 2200 : 85;
            ramScore = currentHardware.ram * 135;
          } else if (currentHardware.id === "low_netbook") {
            cpuScore = 800;
            gpuScore = 120;
            diskScore = 480; // SATA SSD
            ramScore = 800;
          } else if (currentHardware.id === "old_imac") {
            cpuScore = 1400;
            gpuScore = 320;
            diskScore = 85; // HDD slow
            ramScore = 1100;
          } else if (currentHardware.id === "apple_silicon_m1") {
            cpuScore = 3800;
            gpuScore = 2900;
            diskScore = 2600; // Fast NVMe
            ramScore = 4500; // Unified
          } else if (currentHardware.id === "ryzen_minipc") {
            cpuScore = 2900;
            gpuScore = 980;
            diskScore = 1800;
            ramScore = 2100;
          } else if (currentHardware.id === "gaming_rtx") {
            cpuScore = 5200;
            gpuScore = 8400;
            diskScore = 3500;
            ramScore = 3800;
          }

          setBenchmarkScores({
            cpu: cpuScore,
            gpu: gpuScore,
            disk: diskScore,
            ram: ramScore,
            overall: Math.round((cpuScore + gpuScore + diskScore * 0.2 + ramScore * 0.5) / 3),
          });
        }
      }, currentDelay);
      currentDelay += step.delay;
    });
  };

  // Automated optimizations based on active profile and active hardware
  const getOptimalSettings = () => {
    let runtime = "llama.cpp (GGUF)";
    let threadCount = Math.max(1, currentHardware.threads - 1);
    let quantization = "Q4_K_M";
    let batchSize = 4;
    let cacheCompression = "Abilitata (FP8)";

    if (currentHardware.id === "apple_silicon_m1") {
      runtime = "MLX Framework";
      quantization = "Q4 (MLX)";
    } else if (currentHardware.id === "gaming_rtx") {
      runtime = "TensorRT-LLM / llama.cpp (CUDA)";
      quantization = "Q8_0 / AWQ INT4";
    } else if (currentHardware.id === "custom") {
      if (currentHardware.vram >= 6) {
        runtime = "llama.cpp (CUDA/DirectX)";
        quantization = "Q8_0 / AWQ INT4";
      } else if (currentHardware.ram >= 16) {
        runtime = "llama.cpp (AVX2 CPU)";
        quantization = "Q4_K_M (Bilanciata)";
      } else {
        runtime = "llama.cpp (Low-RAM Mode)";
        quantization = "IQ2_XS (Quantizzazione Estrema)";
      }
    }

    if (selectedProfileId === "eco") {
      quantization = currentHardware.id === "apple_silicon_m1" ? "Q2_K" : "IQ2_XS";
      batchSize = 1;
      threadCount = Math.max(1, Math.round(currentHardware.threads * 0.5));
      cacheCompression = "Compressione Estrema (INT4)";
    } else if (selectedProfileId === "turbo") {
      batchSize = 16;
      threadCount = currentHardware.threads;
      cacheCompression = "Disattivata (Precisione FP16)";
    }

    return { runtime, threadCount, quantization, batchSize, cacheCompression };
  };

  const opt = getOptimalSettings();

  return (
    <div className="space-y-6" id="optimizer-tab">
      
      {/* System Eligibility & Installation Status Banner */}
      <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-4" id="system-installability-status">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Verifica Requisiti & Stato Installabilità Locale
            </h3>
            <p className="text-xs text-zinc-500">
              Analisi delle risorse fisiche necessarie per abilitare l'Inference Engine di AI Hub offline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {installed ? (
              <span className="text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                SISTEMA INSTALLATO & ATTIVO
              </span>
            ) : isFullyEligible ? (
              <span className="text-xs font-mono font-bold bg-emerald-950/30 text-emerald-400 border border-emerald-900 px-3 py-1.5 rounded-lg">
                🟢 IDONEO ALL'INSTALLAZIONE
              </span>
            ) : (
              <span className="text-xs font-mono font-bold bg-red-950/30 text-red-400 border border-red-900 px-3 py-1.5 rounded-lg">
                🔴 REQUISITI INSUFFICIENTI / DA CONFIGURARE
              </span>
            )}
          </div>
        </div>

        {/* Requirements check list */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className={`p-3 rounded-lg border ${isRamEligible ? "bg-emerald-950/15 border-emerald-900/50 text-emerald-300" : "bg-red-950/15 border-red-900/50 text-red-300"}`}>
            <div className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider">Memoria RAM</div>
            <div className="font-bold text-sm mt-0.5">{currentHardware.ram} GB</div>
            <div className="text-[10px] text-zinc-400 mt-1">Requisito Min: 8 GB</div>
          </div>
          
          <div className={`p-3 rounded-lg border ${isCpuEligible ? "bg-emerald-950/15 border-emerald-900/50 text-emerald-300" : "bg-red-950/15 border-red-900/50 text-red-300"}`}>
            <div className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider">Core CPU</div>
            <div className="font-bold text-sm mt-0.5">{currentHardware.cores} Cores / {currentHardware.threads} Threads</div>
            <div className="text-[10px] text-zinc-400 mt-1">Requisito Min: 4 Cores</div>
          </div>

          <div className={`p-3 rounded-lg border ${isStorageEligible ? "bg-emerald-950/15 border-emerald-900/50 text-emerald-300" : "bg-red-950/15 border-red-900/50 text-red-300"}`}>
            <div className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider">Storage Tipo</div>
            <div className="font-bold text-sm mt-0.5">{currentHardware.storageType}</div>
            <div className="text-[10px] text-zinc-400 mt-1">Consigliato: SSD</div>
          </div>

          <div className={`p-3 rounded-lg border ${isSpaceEligible ? "bg-emerald-950/15 border-emerald-900/50 text-emerald-300" : "bg-red-950/15 border-red-900/50 text-red-300"}`}>
            <div className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider">Spazio Libero</div>
            <div className="font-bold text-sm mt-0.5">{currentHardware.freeSpace} GB</div>
            <div className="text-[10px] text-zinc-400 mt-1">Richiesto: 15 GB</div>
          </div>
        </div>

        {/* Action controls for installation */}
        <div className="p-4 bg-barbg border border-zinc-850 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400 max-w-xl">
            {installed ? (
              <span className="text-emerald-400 font-semibold">✓ Il motore di calcolo è stato installato con successo sulla sandbox locale dell'applicazione e configurato per la massima efficienza!</span>
            ) : isFullyEligible ? (
              "Il tuo hardware risponde perfettamente ai requisiti di sistema. Clicca sul pulsante a destra per sbloccare l'installazione locale."
            ) : (
              "Attenzione: i requisiti minimi non sono pienamente soddisfatti per questo profilo hardware (il sistema risulta non installabile). Inserisci manualmente le specifiche hardware del tuo vero PC nel tab a sinistra se la telemetria automatica ha fallito, o forza l'installazione."
            )}
          </div>

          {!installed ? (
            <button
              onClick={handleStartInstallation}
              disabled={installing}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold font-mono shadow-md transition ${
                isFullyEligible
                  ? "bg-emerald-500 hover:bg-emerald-600 text-black cursor-pointer"
                  : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-800/60 cursor-pointer"
              }`}
            >
              {installing ? "Installazione in corso..." : isFullyEligible ? "Avvia Installazione Locale" : "Forza Installazione"}
            </button>
          ) : (
            <button
              onClick={() => {
                setInstalled(false);
                setInstallProgress(0);
              }}
              className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 text-xs font-mono rounded border border-zinc-800 cursor-pointer"
            >
              Rimuovi / Resetta Installazione
            </button>
          )}
        </div>

        {/* Visual Install progress terminal */}
        {installing && (
          <div className="p-4 bg-[#070707] border border-zinc-850 rounded-lg space-y-2 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-400 animate-pulse">{installStep}</span>
              <span className="text-zinc-500">{installProgress}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${installProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Target Computer Layout Emulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hardware Profiler Options Panel */}
        <div className="lg:col-span-1 p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-4 animate-fade-in" id="hardware-profiler-presets">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Sorgente Dati Hardware
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Scegli se simulare un profilo preimpostato o inserire manualmente le caratteristiche del tuo vero PC.
            </p>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex border-b border-zinc-800 pb-1 gap-1">
            <button
              onClick={() => setHardwareTab("predefined")}
              className={`flex-1 py-1.5 text-[11px] font-mono font-bold text-center border-b-2 transition cursor-pointer ${
                hardwareTab === "predefined"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Simulazione Preset
            </button>
            <button
              onClick={() => {
                setHardwareTab("manual");
                loadCurrentIntoForm();
              }}
              className={`flex-1 py-1.5 text-[11px] font-mono font-bold text-center border-b-2 transition cursor-pointer ${
                hardwareTab === "manual"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              ✏️ Inserimento Manuale
            </button>
          </div>

          {hardwareTab === "predefined" ? (
            <div className="space-y-2.5">
              {HARDWARE_PRESETS.map((preset) => {
                const isSelected = selectedHardwareId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onHardwareChange(preset.id);
                      setBenchmarkScores(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-800/40 border-emerald-500/80 shadow-md"
                        : "bg-appbg hover:bg-zinc-800/20 border-zinc-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-zinc-100 truncate pr-2">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-900 px-1 py-0.2 rounded font-bold">
                          SELEZIONATO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                      CPU: {preset.cpu} • RAM: {preset.ram}GB
                    </div>
                  </button>
                );
              })}

              {selectedHardwareId === "custom" && (
                <div className="w-full text-left p-3 rounded-lg border bg-zinc-800/40 border-emerald-500/80 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-emerald-400 truncate pr-2">
                      {currentHardware.name}
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-900 px-1.5 py-0.2 rounded font-bold animate-pulse">
                      MANUALE ATTIVO
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                    CPU: {currentHardware.cpu} • RAM: {currentHardware.ram}GB
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveCustomHardware} className="space-y-3.5 text-xs bg-appbg/40 p-3 rounded-lg border border-zinc-850">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Inserisci Specifiche Reali</span>
              
              <div>
                <label className="text-[10px] text-zinc-500 font-mono block mb-1">Nome / Modello del PC</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-appbg border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-xs"
                  placeholder="Es: Il Mio PC Desktop"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">CPU Modello</label>
                  <input
                    type="text"
                    required
                    value={customCpu}
                    onChange={(e) => setCustomCpu(e.target.value)}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-zinc-700 text-xs"
                    placeholder="Es: AMD Ryzen 5"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">GPU Modello</label>
                  <input
                    type="text"
                    required
                    value={customGpu}
                    onChange={(e) => setCustomGpu(e.target.value)}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-zinc-700 text-xs"
                    placeholder="Es: NVIDIA RTX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">RAM (GB)</label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="256"
                    value={customRam}
                    onChange={(e) => setCustomRam(parseInt(e.target.value))}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">VRAM GPU (GB)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="48"
                    step="0.5"
                    value={customVram}
                    onChange={(e) => setCustomVram(parseFloat(e.target.value))}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">Cores CPU</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="64"
                    value={customCores}
                    onChange={(e) => setCustomCores(parseInt(e.target.value))}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">Threads CPU</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="128"
                    value={customThreads}
                    onChange={(e) => setCustomThreads(parseInt(e.target.value))}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">Storage Tipo</label>
                  <select
                    value={customStorage}
                    onChange={(e) => setCustomStorage(e.target.value as any)}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-xs"
                  >
                    <option value="SSD">SSD (Velocità elevata)</option>
                    <option value="HDD">HDD (Rallentamenti)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono block mb-1">Spazio Libero (GB)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10000"
                    value={customFreeSpace}
                    onChange={(e) => setCustomFreeSpace(parseInt(e.target.value))}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={loadCurrentIntoForm}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 py-2 rounded text-[11px] font-mono transition cursor-pointer"
                >
                  Copia Corrente
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2 rounded text-[11px] font-mono transition cursor-pointer shadow-md"
                >
                  Salva e Applica
                </button>
              </div>
            </form>
          )}

          <div className="p-3 bg-barbg border border-zinc-800 rounded-lg text-xs space-y-2">
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wide border-b border-zinc-800 pb-1 flex items-center justify-between">
              <span>Specifiche Rilevate</span>
              <Monitor className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Core Fisici CPU:</span>
              <span className="font-mono text-zinc-300">{currentHardware.cores}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Thread Logici CPU:</span>
              <span className="font-mono text-zinc-300">{currentHardware.threads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Scheda Video (GPU):</span>
              <span className="font-mono text-zinc-300 truncate max-w-[120px]">{currentHardware.gpu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tipo Storage / Spazio:</span>
              <span className="font-mono text-zinc-300">{currentHardware.storageType} ({currentHardware.freeSpace} GB Liberi)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Auto-Tuner & Benchmark Panel */}
        <div className="lg:col-span-2 p-5 bg-panelbg border border-zinc-800 rounded-xl flex flex-col justify-between space-y-6" id="benchmark-autotuner-panel">
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Benchmark locale & Auto-Tuning
                </h3>
                <p className="text-xs text-zinc-500">Analizza RAM, CPU e GPU per forzare i parametri migliori di esecuzione.</p>
              </div>

              <button
                onClick={runBenchmark}
                disabled={benchmarkActive}
                className="flex items-center justify-center space-x-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs disabled:opacity-50 transition cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>{benchmarkActive ? "Esecuzione in corso..." : "Esegui Benchmark Locale"}</span>
              </button>
            </div>

            {/* Benchmark Runner Simulator */}
            {benchmarkActive && (
              <div className="p-4 bg-barbg border border-zinc-800 rounded-lg mt-4 text-center space-y-3">
                <div className="inline-block relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                </div>
                <div className="text-xs font-mono text-emerald-400 animate-pulse">{benchmarkStep}</div>
              </div>
            )}

            {/* Benchmark Scores */}
            {benchmarkScores && (
              <div className="mt-4 p-4 bg-barbg border border-emerald-950 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Punteggio Prestazioni Hardware</h4>
                  <span className="text-xs font-mono font-bold bg-emerald-900/40 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                    Overall: {benchmarkScores.overall} pts
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-[#141414] border border-zinc-800 p-2.5 rounded-lg">
                    <div className="text-[10px] text-zinc-500 font-mono">CPU FP16</div>
                    <div className="text-base font-bold font-mono text-zinc-200">{benchmarkScores.cpu} pts</div>
                  </div>
                  <div className="bg-[#141414] border border-zinc-800 p-2.5 rounded-lg">
                    <div className="text-[10px] text-zinc-500 font-mono">GPU Vulkan</div>
                    <div className="text-base font-bold font-mono text-zinc-200">{benchmarkScores.gpu} pts</div>
                  </div>
                  <div className="bg-[#141414] border border-zinc-800 p-2.5 rounded-lg">
                    <div className="text-[10px] text-zinc-500 font-mono">Velocità Disco</div>
                    <div className="text-base font-bold font-mono text-zinc-200">{benchmarkScores.disk} MB/s</div>
                  </div>
                  <div className="bg-[#141414] border border-zinc-800 p-2.5 rounded-lg">
                    <div className="text-[10px] text-zinc-500 font-mono">Banda RAM</div>
                    <div className="text-base font-bold font-mono text-zinc-200">{benchmarkScores.ram} MB/s</div>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Calculated Optimizer Config */}
            <div className="mt-5 space-y-4">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                Mappa dei Parametri Ottimizzati (Auto-Tuned)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-barbg border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 font-mono block">RUNTIME SELEZIONATO</span>
                  <span className="text-xs font-bold text-zinc-200 font-mono">{opt.runtime}</span>
                </div>
                <div className="p-3 bg-barbg border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 font-mono block">QUANTIZZAZIONE OTTIMALE</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">{opt.quantization}</span>
                </div>
                <div className="p-3 bg-barbg border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 font-mono block">THREAD LOGICI ALLOCATI</span>
                  <span className="text-xs font-bold text-zinc-200 font-mono">{opt.threadCount} Cores</span>
                </div>
                <div className="p-3 bg-barbg border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 font-mono block">BATCH SIZE DINAMICO</span>
                  <span className="text-xs font-bold text-zinc-200 font-mono">{opt.batchSize}</span>
                </div>
                <div className="p-3 bg-barbg border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 font-mono block">KV CACHE COMPRESSION</span>
                  <span className="text-xs font-bold text-zinc-200 font-mono">{opt.cacheCompression}</span>
                </div>
                <div className="p-3 bg-barbg border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 font-mono block">DISPOSITIVO DI CALCOLO</span>
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    {currentHardware.vram === 0.5 ? "CPU Solo (Threadpool)" : "GPU + CPU Ibrido"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Advisor advanced diagnostic section */}
          <div className="border-t border-zinc-800 pt-4 mt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  Diagnostica Avanzata con AI Assistant
                </h4>
                <p className="text-[11px] text-zinc-500">Invia le metriche dell'hardware di questa macchina a Gemini per ricevere una recensione personalizzata.</p>
              </div>

              <button
                onClick={onDiagnose}
                disabled={isDiagnosing}
                className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 font-semibold px-4 py-2 rounded-lg text-xs disabled:opacity-50 transition cursor-pointer"
              >
                {isDiagnosing ? "Generazione in corso..." : "Richiedi Diagnosi AI"}
              </button>
            </div>

            {diagnosticsText ? (
              <div className="p-4 bg-barbg border border-zinc-800 rounded-lg text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line prose prose-invert font-sans">
                {diagnosticsText}
              </div>
            ) : (
              <div className="p-3 bg-barbg/60 border border-zinc-800/60 rounded-lg text-center text-xs text-zinc-500">
                Fai clic su "Richiedi Diagnosi AI" per avviare l'analisi approfondita con l'esperto del sistema.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
