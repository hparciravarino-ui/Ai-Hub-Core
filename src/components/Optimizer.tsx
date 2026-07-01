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
}

export default function Optimizer({
  currentHardware,
  selectedHardwareId,
  onHardwareChange,
  selectedProfileId,
  onDiagnose,
  diagnosticsText,
  isDiagnosing,
}: OptimizerProps) {
  const [benchmarkActive, setBenchmarkActive] = useState(false);
  const [benchmarkStep, setBenchmarkStep] = useState("");
  const [benchmarkScores, setBenchmarkScores] = useState<any | null>(null);

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

          if (currentHardware.id === "low_netbook") {
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
      {/* Target Computer Layout Emulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware Presets Panel */}
        <div className="lg:col-span-1 p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-4" id="hardware-profiler-presets">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Simulazione Hardware Ospite
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Seleziona un profilo hardware per verificare come l'AI Engine si autotuning.
            </p>
          </div>

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
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
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
          </div>

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
                className="flex items-center justify-center space-x-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs disabled:opacity-50 transition"
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
              <div className="mt-4 p-4 bg-barbg border border-emerald-950 rounded-xl space-y-3">
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
                className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 font-semibold px-4 py-2 rounded-lg text-xs disabled:opacity-50 transition"
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
