import React, { useState, useEffect } from "react";
import { IHAL } from "../../engines/ihal/IHAL";
import { HardwareProfile, ResourceAllocationRequest, LoadPrediction } from "../../engines/ihal/types";
import { 
    Cpu, 
    HardDrive,
    Thermometer,
    Battery,
    Zap,
    MemoryStick,
    Gauge,
    Server,
    Activity,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";

export default function IHALDashboard() {
    const ihal = IHAL.getInstance();
    const [profile, setProfile] = useState<HardwareProfile | null>(null);
    const [predictionResult, setPredictionResult] = useState<LoadPrediction | null>(null);

    useEffect(() => {
        const updateProfile = () => setProfile({ ...ihal.getAvailableResources() });
        updateProfile();
        const interval = setInterval(updateProfile, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!profile) return null;

    const getModeColor = (mode: string) => {
        switch (mode) {
            case "LOW_POWER": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            case "BALANCED": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case "HIGH_PERFORMANCE": return "text-rose-400 bg-rose-400/10 border-rose-400/20";
            default: return "text-zinc-400 bg-zinc-800 border-zinc-700";
        }
    };

    const simulatePrediction = () => {
        const pred = ihal.loadPredictor.predictLoad("inference", 4800, 2048, profile);
        setPredictionResult(pred);
    };

    const simulateThermalSpike = () => {
        ihal.profiler.setSimulatedState({ thermal: { temperatureCelsius: 88, thermalThrottlingState: "SEVERE" } });
    };

    const simulateLowBattery = () => {
        ihal.profiler.setSimulatedState({ power: { batteryState: "BATTERY", powerMode: "saver", batteryLevelPercent: 15 } });
    };
    
    const restoreNormal = () => {
        ihal.profiler.setSimulatedState({ 
            thermal: { temperatureCelsius: 45, thermalThrottlingState: "NONE" },
            power: { batteryState: "AC", powerMode: "balanced", batteryLevelPercent: 100 }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border border-zinc-800 bg-zinc-950 p-6 rounded-lg shadow-xl gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-bold text-zinc-100 tracking-tight font-sans">
                            Intelligent Hardware Abstraction Layer (IHAL)
                        </h2>
                        <span className="bg-amber-950/60 text-amber-500 border border-amber-900/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                            CHAP 9
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                        Astrae completamente l'hardware fisico. Previene OOM, bilancia carico CPU/GPU,
                        regola l'assorbimento termico ed energetico dinamicamente.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded text-xs font-bold border ${getModeColor(profile.mode)}`}>
                        {profile.mode}
                    </div>
                </div>
            </div>

            {/* Hardware Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Compute */}
                <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                            <Cpu className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold font-sans uppercase">Compute</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500">{profile.arch}</span>
                    </div>
                    <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">ST Perf</span>
                            <span className="text-zinc-300">{profile.compute.singleThreadPerformance}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">MT Perf</span>
                            <span className="text-zinc-300">{profile.compute.multiThreadPerformance}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">GPU CUs</span>
                            <span className="text-emerald-400 font-bold">{profile.compute.gpuComputeUnits}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap mt-2">
                            {profile.compute.vectorizationSupport.map(v => (
                                <span key={v} className="bg-zinc-800 text-zinc-400 text-[8px] px-1 py-0.5 rounded">{v}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Memory */}
                <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                            <MemoryStick className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold font-sans uppercase">Memory</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500">{profile.memory.memoryBandwidthGBs} GB/s</span>
                    </div>
                    <div className="space-y-2 mt-2">
                        <div>
                            <div className="flex justify-between text-[10px] font-mono mb-1">
                                <span className="text-zinc-500">RAM Libera</span>
                                <span className={profile.memory.availableRamMb < 2048 ? "text-red-400 font-bold" : "text-zinc-300"}>
                                    {profile.memory.availableRamMb.toFixed(0)} / {profile.memory.totalRamMb} MB
                                </span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-1">
                                <div className={`h-1 rounded-full ${profile.memory.availableRamMb < 2048 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${(profile.memory.availableRamMb / profile.memory.totalRamMb) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-mono mb-1">
                                <span className="text-zinc-500">VRAM Libera</span>
                                <span className="text-indigo-400 font-bold">
                                    {profile.memory.availableVramMb.toFixed(0)} / {profile.memory.totalVramMb} MB
                                </span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-1">
                                <div className="bg-indigo-400 h-1 rounded-full" style={{ width: `${(profile.memory.availableVramMb / profile.memory.totalVramMb) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thermal */}
                <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                            <Thermometer className="w-4 h-4 text-rose-400" />
                            <span className="text-xs font-bold font-sans uppercase">Thermal</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center space-y-2 mt-2">
                        <span className={`text-3xl font-mono font-bold ${profile.thermal.temperatureCelsius > 80 ? 'text-rose-500' : 'text-zinc-200'}`}>
                            {profile.thermal.temperatureCelsius.toFixed(1)}°C
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                            profile.thermal.thermalThrottlingState === "SEVERE" ? "bg-rose-500/20 text-rose-400 border-rose-500/40" :
                            profile.thermal.thermalThrottlingState === "LIGHT" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                            "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}>
                            Throttling: {profile.thermal.thermalThrottlingState}
                        </span>
                    </div>
                </div>

                {/* Power */}
                <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                            <Battery className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold font-sans uppercase">Power</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">{profile.power.batteryState}</span>
                    </div>
                    <div className="space-y-3 mt-2">
                        <div>
                            <div className="flex justify-between text-[10px] font-mono mb-1">
                                <span className="text-zinc-500">Livello Batteria</span>
                                <span className={profile.power.batteryLevelPercent <= 20 ? "text-rose-400 font-bold" : "text-amber-400 font-bold"}>
                                    {profile.power.batteryLevelPercent}%
                                </span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                <div className={`h-2 rounded-full ${profile.power.batteryLevelPercent <= 20 ? 'bg-rose-500' : 'bg-amber-400'}`} style={{ width: `${profile.power.batteryLevelPercent}%` }}></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">Power Mode</span>
                            <span className="text-zinc-300 uppercase">{profile.power.powerMode}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Simulators & Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Fallback Simulators */}
                <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-zinc-200">Hardware Failure Isolation (9.17)</h3>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={simulateThermalSpike} className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-rose-400 py-2 rounded transition-all">
                            Simula Thermal Spike
                        </button>
                        <button onClick={simulateLowBattery} className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-amber-400 py-2 rounded transition-all">
                            Simula Low Battery
                        </button>
                    </div>
                    <button onClick={restoreNormal} className="w-full bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-900/50 text-[10px] font-mono text-emerald-400 py-2 rounded transition-all">
                        Ripristina Stato Normale
                    </button>
                    <p className="text-[10px] text-zinc-500 italic mt-2">
                        Guarda come il Resource Scheduler reagisce: in Low Battery forzerà il fallback su CPU per risparmiare energia (9.13). Se Thermal Throttling = SEVERE, ritarderà i task non critici (9.12).
                    </p>
                </div>

                {/* Load Predictor */}
                <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-semibold text-zinc-200">Load Prediction Engine (9.8)</h3>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={simulatePrediction} className="bg-indigo-600 hover:bg-indigo-500 text-zinc-100 font-mono text-xs px-4 py-2 rounded transition-all">
                            Prevedi Carico per "Llama-3-8B"
                        </button>
                    </div>
                    
                    {predictionResult && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-3 space-y-2 mt-2">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-zinc-500">RAM Stimata:</span>
                                <span className="text-zinc-200">{predictionResult.predictedRamMb.toFixed(0)} MB</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-zinc-500">VRAM Stimata:</span>
                                <span className="text-indigo-400 font-bold">{predictionResult.predictedVramMb.toFixed(0)} MB</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-zinc-500">Tempo Stimato (Inf):</span>
                                <span className="text-emerald-400">{predictionResult.estimatedTimeMs.toFixed(0)} ms</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-zinc-500">Rischio Termico:</span>
                                <span className={predictionResult.thermalRisk === "LOW" ? "text-emerald-400" : "text-rose-400"}>
                                    {predictionResult.thermalRisk}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono pt-2 border-t border-zinc-800">
                                <span className="text-zinc-400">Target Suggerito (9.10):</span>
                                <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-200 font-bold">
                                    {predictionResult.suggestedExecutionType}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
