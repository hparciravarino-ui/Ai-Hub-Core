import React, { useState, useEffect } from "react";
import { Brain, Cpu, ShieldCheck, Zap, RefreshCw, BarChart2, CheckCircle2, Play, AlertCircle, Award, ListFilter, HelpCircle } from "lucide-react";

interface ModelProfile {
    id: string;
    name: string;
    category: string;
    parametersBillion: number;
    recommendedRuntime: string;
    minRamGb: number;
    estimatedTps: number;
    energyFactor: number;
    quantization: string;
}

interface RealtimeKPIs {
    totalInferencesProcessed: number;
    avgResponseTimeMs: number;
    maxResponseTimeMs: number;
    averageTokensPerSecond: number;
    recoveryRatePercent: number;
    cacheHits: number;
    cacheMisses: number;
    activeModelPoolSize: number;
    noLockInAdaptersCount: number;
}

interface TraceabilityRequirement {
    id: string;
    requirement: string;
    affectedModules: string[];
    dependenciesInvolved: string[];
    verificationCriteria: string;
    requiredTests: string[];
    predictedImpact: string;
}

export default function AIOrchestratorDashboard() {
    const [models, setModels] = useState<ModelProfile[]>([]);
    const [kpis, setKpis] = useState<RealtimeKPIs | null>(null);
    const [traceability, setTraceability] = useState<TraceabilityRequirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"monitor" | "test" | "traceability">("monitor");

    // Live Test Form State
    const [prompt, setPrompt] = useState("Scrivi una classe TypeScript per gestire l'allocazione asincrona di memoria.");
    const [priority, setPriority] = useState<"Massima" | "Alta" | "Media" | "Bassa" | "Background">("Alta");
    const [contextLevel, setContextLevel] = useState<string>("Progetto");
    const [forceCategory, setForceCategory] = useState<string>("");
    
    const [executing, setExecuting] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [modelsRes, kpisRes, traceRes] = await Promise.all([
                fetch("/api/core/orchestrator/models"),
                fetch("/api/core/orchestrator/kpis"),
                fetch("/api/core/orchestrator/traceability")
            ]);
            
            const modelsData = await modelsRes.json();
            const kpisData = await kpisRes.json();
            const traceData = await traceRes.json();

            setModels(modelsData);
            setKpis(kpisData);
            setTraceability(traceData);
        } catch (e) {
            console.error("Failed to load AI Orchestrator telemetry:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRunTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setExecuting(true);
        setTestResult(null);

        try {
            const res = await fetch("/api/core/orchestrator/task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description: `Richiesta di test playground: ${prompt.substring(0, 40)}...`,
                    category: forceCategory || undefined,
                    priority,
                    contextLevel,
                    payload: {
                        prompt,
                        maxTokens: 512
                    }
                })
            });

            const data = await res.json();
            setTestResult(data);
            
            // Refresh KPIs
            const kpisRes = await fetch("/api/core/orchestrator/kpis");
            const kpisData = await kpisRes.json();
            setKpis(kpisData);
        } catch (err: any) {
            setTestResult({ error: err.message });
        } finally {
            setExecuting(false);
        }
    };

    if (loading && !kpis) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4" id="orchestrator-loader">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Sincronizzazione Kernel Telemetria...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6" id="ai-orchestrator-dashboard">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden bg-zinc-950 border border-zinc-850 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6" id="orchestrator-header">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="space-y-2 relative z-10">
                    <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-emerald-950/80 border border-emerald-900 rounded-lg">
                            <Brain className="w-5 h-5 text-emerald-400 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Capitolo 6 - AI Kernel</span>
                            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">AI Orchestrator Kernel</h2>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                        L'unico punto di ingresso standard dell'ecosistema AI. Coordina modelli eterogenei, seleziona runtime adattivi, ottimizza l'allocazione hardware e gestisce flussi di recupero a 6 livelli con garanzia totale NO LOCK-IN.
                    </p>
                </div>

                <div className="flex space-x-2 relative z-10">
                    <button
                        onClick={fetchData}
                        className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Aggiorna Dati</span>
                    </button>
                </div>
            </div>

            {/* Sub-Navigation Menu */}
            <div className="flex border-b border-zinc-850">
                <button
                    onClick={() => setActiveSubTab("monitor")}
                    className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all -mb-px cursor-pointer ${
                        activeSubTab === "monitor"
                            ? "border-emerald-500 text-emerald-400"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    <div className="flex items-center space-x-1.5">
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Monitor & Telemetria</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveSubTab("test")}
                    className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all -mb-px cursor-pointer ${
                        activeSubTab === "test"
                            ? "border-emerald-500 text-emerald-400"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    <div className="flex items-center space-x-1.5">
                        <Play className="w-3.5 h-3.5" />
                        <span>Inference Playground</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveSubTab("traceability")}
                    className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all -mb-px cursor-pointer ${
                        activeSubTab === "traceability"
                            ? "border-emerald-500 text-emerald-400"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    <div className="flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>Matrice di Tracciabilità</span>
                    </div>
                </button>
            </div>

            {/* TAB CONTENT: MONITOR */}
            {activeSubTab === "monitor" && (
                <div className="space-y-6" id="orchestrator-tab-monitor">
                    {/* Real-time KPI Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="orchestrator-kpis-grid">
                        <div className="bg-[#0c0c0e] border border-zinc-850 p-4 rounded-xl space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Infezioni elaborate</span>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-xl font-bold text-zinc-100">{kpis?.totalInferencesProcessed || 0}</span>
                                <span className="text-[9px] font-mono text-emerald-400 font-bold">REAL-TIME</span>
                            </div>
                        </div>

                        <div className="bg-[#0c0c0e] border border-zinc-850 p-4 rounded-xl space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Velocità di Generazione</span>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-xl font-bold text-zinc-100">{kpis?.averageTokensPerSecond || 0}</span>
                                <span className="text-[9px] font-mono text-zinc-500">tok/sec</span>
                            </div>
                        </div>

                        <div className="bg-[#0c0c0e] border border-zinc-850 p-4 rounded-xl space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Latenza Media</span>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-xl font-bold text-zinc-100">{kpis?.avgResponseTimeMs || 0}</span>
                                <span className="text-[9px] font-mono text-zinc-500">ms</span>
                            </div>
                        </div>

                        <div className="bg-[#0c0c0e] border border-zinc-850 p-4 rounded-xl space-y-1">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Auto-Recovery Rate</span>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-xl font-bold text-emerald-400">{kpis?.recoveryRatePercent || 0}%</span>
                                <span className="text-[9px] font-mono text-emerald-500">RESILIENT</span>
                            </div>
                        </div>
                    </div>

                    {/* Registry & Decoupled Architecture View */}
                    <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden" id="orchestrator-registry-section">
                        <div className="px-5 py-4 border-b border-zinc-850 flex justify-between items-center bg-[#0d0d10]">
                            <div>
                                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Modelli Registrati Decoupled (No Lock-In)</h3>
                                <p className="text-[10px] text-zinc-500 mt-0.5">I modelli sono censiti e caricati dinamicamente senza collegamenti rigidi con librerie proprietarie.</p>
                            </div>
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/60 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                                {models.length} Modelli Pronti
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse font-mono text-[11px]">
                                <thead>
                                    <tr className="border-b border-zinc-850 bg-zinc-900/20 text-zinc-400">
                                        <th className="p-3">IDENTIFICATIVO</th>
                                        <th className="p-3">NOME IN APPLICAZIONE</th>
                                        <th className="p-3">CATEGORIA</th>
                                        <th className="p-3">PARAMETRI</th>
                                        <th className="p-3">RUNTIME STANDARD</th>
                                        <th className="p-3">RAM MINIMA</th>
                                        <th className="p-3">TPS ESTIMATI</th>
                                        <th className="p-3">CONSUMO ENERGETICO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {models.map((model) => (
                                        <tr key={model.id} className="border-b border-zinc-900 hover:bg-zinc-900/40 transition-all text-zinc-300">
                                            <td className="p-3 text-emerald-400 font-bold">{model.id}</td>
                                            <td className="p-3 font-semibold text-zinc-100">{model.name}</td>
                                            <td className="p-3">
                                                <span className="bg-zinc-900 px-2 py-0.5 rounded text-zinc-400 border border-zinc-800">
                                                    {model.category}
                                                </span>
                                            </td>
                                            <td className="p-3">{model.parametersBillion}B</td>
                                            <td className="p-3 text-violet-400 font-bold">{model.recommendedRuntime}</td>
                                            <td className="p-3">{model.minRamGb} GB</td>
                                            <td className="p-3">{model.estimatedTps} tok/s</td>
                                            <td className="p-3">
                                                <div className="flex space-x-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <div 
                                                            key={i} 
                                                            className={`w-1.5 h-3.5 rounded ${
                                                                i < model.energyFactor 
                                                                    ? model.energyFactor > 3 ? "bg-amber-500" : "bg-emerald-500"
                                                                    : "bg-zinc-800"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: PLAYGROUND / TEST */}
            {activeSubTab === "test" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="orchestrator-tab-test">
                    {/* Control Form */}
                    <div className="lg:col-span-1 bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Configuratore Richiesta</h3>
                            <p className="text-[10px] text-zinc-500">Metti alla prova l'algoritmo di routing e l'allocazione dinamica del kernel AI.</p>
                        </div>

                        <form onSubmit={handleRunTask} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Prompt del compito</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={4}
                                    className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none p-2.5 rounded-lg text-zinc-100"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Priorità</label>
                                    <select
                                        value={priority}
                                        onChange={(e: any) => setPriority(e.target.value)}
                                        className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none p-2 rounded-lg text-zinc-200"
                                    >
                                        <option value="Massima">Massima (Immediate)</option>
                                        <option value="Alta">Alta</option>
                                        <option value="Media">Media</option>
                                        <option value="Bassa">Bassa</option>
                                        <option value="Background">Background</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Livello Contesto</label>
                                    <select
                                        value={contextLevel}
                                        onChange={(e) => setContextLevel(e.target.value)}
                                        className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none p-2 rounded-lg text-zinc-200"
                                    >
                                        <option value="Messaggio">Messaggio</option>
                                        <option value="Chat">Chat</option>
                                        <option value="Progetto">Progetto</option>
                                        <option value="Knowledge Vault">Knowledge Vault</option>
                                        <option value="Digital Brain">Digital Brain</option>
                                        <option value="Knowledge Graph">Knowledge Graph</option>
                                        <option value="Memoria Permanente">Memoria Permanente</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Forza Categoria (Opzionale)</label>
                                <select
                                    value={forceCategory}
                                    onChange={(e) => setForceCategory(e.target.value)}
                                    className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none p-2 rounded-lg text-zinc-200"
                                >
                                    <option value="">Auto-Routing (Consigliato)</option>
                                    <option value="Chat">Chat</option>
                                    <option value="Programmazione">Programmazione</option>
                                    <option value="Debug">Debug</option>
                                    <option value="Refactoring">Refactoring</option>
                                    <option value="Analisi Repository">Analisi Repository</option>
                                    <option value="Workflow">Workflow</option>
                                    <option value="Reasoning">Reasoning</option>
                                    <option value="Planning">Planning</option>
                                    <option value="Benchmark">Benchmark</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={executing}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 border border-emerald-500 hover:border-emerald-400 disabled:border-zinc-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                            >
                                {executing ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Orchestratore in elaborazione...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Sottometti ad AI Orchestrator</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Results Terminal Output */}
                    <div className="lg:col-span-2 bg-[#08080a] border border-zinc-850 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
                        <div className="px-5 py-3 border-b border-zinc-850 flex justify-between items-center bg-[#0d0d10]">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Inference Telemetry Console</span>
                            <div className="flex space-x-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                            </div>
                        </div>

                        <div className="p-5 flex-1 font-mono text-xs text-zinc-300 space-y-4 overflow-y-auto leading-relaxed">
                            {!testResult && !executing && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                                    <HelpCircle className="w-8 h-8 text-zinc-600" />
                                    <p className="text-zinc-500 max-w-sm text-[11px]">
                                        Nessuna richiesta in corso. Premi il tasto di sottomissione per verificare l'allocazione, i punteggi di consenso e il controllo di auto-verifica.
                                    </p>
                                </div>
                            )}

                            {executing && (
                                <div className="space-y-2 animate-pulse">
                                    <p className="text-emerald-400 font-semibold">[KERNEL] Richiesta ricevuta ed indicizzata.</p>
                                    <p className="text-zinc-500">&gt; Esecuzione algoritmo di routing per hardware adattivo...</p>
                                    <p className="text-zinc-500">&gt; Verifica dei parametri RAM/VRAM del profilo di ottimizzazione...</p>
                                    <p className="text-zinc-500">&gt; Generazione di payload protetto per la coda dello Scheduler...</p>
                                </div>
                            )}

                            {testResult && (
                                <div className="space-y-4">
                                    {/* Success / Recovered Header Banner */}
                                    <div className={`p-3 border rounded-lg flex items-center space-x-3 ${
                                        testResult.status === "recovered" 
                                            ? "bg-amber-950/20 border-amber-900/60 text-amber-300"
                                            : "bg-emerald-950/20 border-emerald-900/60 text-emerald-300"
                                    }`}>
                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        <div>
                                            <p className="font-bold uppercase tracking-wider text-[10px]">Stato: {testResult.status}</p>
                                            <p className="text-[9px] text-zinc-400 mt-0.5">
                                                Task ID: {testResult.taskId} | Categoria: {testResult.category}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Selected parameters */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                                        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-850">
                                            <span className="text-zinc-500 block">Modello Allocato</span>
                                            <span className="font-bold text-zinc-200">{testResult.primaryModel}</span>
                                        </div>
                                        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-850">
                                            <span className="text-zinc-500 block">Runtime Utilizzato</span>
                                            <span className="font-bold text-violet-400">{testResult.runtime}</span>
                                        </div>
                                        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-850">
                                            <span className="text-zinc-500 block">Consenso Abilitato</span>
                                            <span className={`font-bold ${testResult.consensusEnabled ? "text-emerald-400" : "text-zinc-500"}`}>
                                                {testResult.consensusEnabled ? "SÌ (Consensus)" : "NO"}
                                            </span>
                                        </div>
                                        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-850">
                                            <span className="text-zinc-500 block">Self-Verified</span>
                                            <span className={`font-bold ${testResult.selfVerified ? "text-emerald-400" : "text-zinc-500"}`}>
                                                {testResult.selfVerified ? "SÌ (Superato)" : "NO"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Response text output */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Output Sintetizzato Finale</span>
                                        <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-850 whitespace-pre-wrap text-zinc-200 text-[11px] leading-relaxed font-sans">
                                            {testResult.output}
                                        </div>
                                    </div>

                                    {/* Metrics Subsystem */}
                                    {testResult.metrics && (
                                        <div className="space-y-2">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Metriche di Inferenza</span>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[10px]">
                                                <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-900 flex justify-between">
                                                    <span className="text-zinc-500">Generazione:</span>
                                                    <span className="font-bold text-zinc-200">{testResult.metrics.tokensPerSecond} tok/s</span>
                                                </div>
                                                <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-900 flex justify-between">
                                                    <span className="text-zinc-500">Latenza:</span>
                                                    <span className="font-bold text-zinc-200">{testResult.metrics.responseTimeMs} ms</span>
                                                </div>
                                                <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-900 flex justify-between">
                                                    <span className="text-zinc-500">Memory footprint:</span>
                                                    <span className="font-bold text-zinc-200">{testResult.metrics.ramUsedMb} MB</span>
                                                </div>
                                                <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-900 flex justify-between">
                                                    <span className="text-zinc-500">Consumo energetico:</span>
                                                    <span className="font-bold text-emerald-400">{testResult.metrics.energyCostScore} W/Score</span>
                                                </div>
                                                <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-900 flex justify-between">
                                                    <span className="text-zinc-500">Temperatura CPU:</span>
                                                    <span className="font-bold text-amber-500">{testResult.metrics.temperatureCelsius} °C</span>
                                                </div>
                                                <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-900 flex justify-between">
                                                    <span className="text-zinc-500">Recuperato:</span>
                                                    <span className={`font-bold ${testResult.metrics.wasRecovered ? "text-amber-400 animate-pulse" : "text-zinc-400"}`}>
                                                        {testResult.metrics.wasRecovered ? "SÌ (L1-L5)" : "NO"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: TRACEABILITY MATRIX */}
            {activeSubTab === "traceability" && (
                <div className="space-y-6 animate-fade-in" id="orchestrator-tab-traceability">
                    <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-2">
                        <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Matrice dei Requisiti - Capitolo 6</h3>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
                            Tracciamento e verifica formale delle specifiche del capitolo **AI Orchestrator (Artificial Intelligence Kernel)** come previsto dai protocolli Aerospace/Medical Systems. Ciascun requisito è collegato a moduli fisici nel codebase del backend.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="traceability-grid">
                        {traceability.map((req) => (
                            <div key={req.id} className="bg-[#0b0b0d] border border-zinc-850 p-5 rounded-xl space-y-3 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/60 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                                            {req.id}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-500">VERIFIED SUCCESSFUL</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-zinc-100 leading-snug">{req.requirement}</h4>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-zinc-900 text-[10px] font-mono">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Moduli Coinvolti:</span>
                                        <span className="text-zinc-300 font-semibold">{req.affectedModules.join(", ")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">File dei Test:</span>
                                        <span className="text-violet-400 font-bold">{req.requiredTests.join(", ")}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-zinc-500 block">Criterio di Accettazione:</span>
                                        <span className="text-zinc-400 block leading-normal font-sans text-[11px] p-2 bg-zinc-900/40 rounded border border-zinc-900">
                                            {req.verificationCriteria}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
