import React, { useState, useEffect } from "react";
import { UMAL } from "../../engines/umal/UMAL";
import { ModelCapabilityProfile, AICapability, CapabilityRequest } from "../../engines/umal/types";
import { 
    Cpu, 
    Network, 
    Zap, 
    CheckCircle2, 
    Database, 
    Code2, 
    Eye, 
    MessageSquare,
    Settings2,
    RotateCw,
    ShieldAlert
} from "lucide-react";

export default function UMALDashboard() {
    const umal = UMAL.getInstance();
    const [models, setModels] = useState<ModelCapabilityProfile[]>([]);
    const [selectedCapabilities, setSelectedCapabilities] = useState<AICapability[]>([]);
    
    // Testing state
    const [testPrompt, setTestPrompt] = useState("Analizza questo snippet di codice e trova i bug.");
    const [testResult, setTestResult] = useState<any>(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const availableCapabilities: AICapability[] = [
        "Text Generation", "Reasoning", "Vision", "Speech", "Embedding", "Code", 
        "Planning", "OCR", "Translation", "Summarization", "Tool Calling", 
        "Function Calling", "RAG", "Agents", "Long Context", "Structured Output", 
        "JSON Mode", "Streaming", "Thinking Mode", "Multimodality"
    ];

    useEffect(() => {
        refreshModels();
    }, []);

    const refreshModels = () => {
        setModels(umal.registry.getAllModels());
    };

    const toggleCapability = (cap: AICapability) => {
        if (selectedCapabilities.includes(cap)) {
            setSelectedCapabilities(selectedCapabilities.filter(c => c !== cap));
        } else {
            setSelectedCapabilities([...selectedCapabilities, cap]);
        }
    };

    const runUMALInference = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsExecuting(true);
        setTestResult(null);

        try {
            const req: CapabilityRequest = {
                requiredCapabilities: selectedCapabilities.length > 0 ? selectedCapabilities : ["Text Generation"]
            };
            
            const result = await umal.execute(testPrompt, req);
            
            setTestResult({
                status: "Success",
                data: result,
                routedModel: result.modelId
            });
        } catch (error: any) {
            setTestResult({
                status: "Error",
                data: error.message
            });
        } finally {
            setIsExecuting(false);
            refreshModels();
        }
    };

    const getCapabilityIcon = (cap: string) => {
        switch (cap) {
            case "Code": return <Code2 className="w-3 h-3" />;
            case "Vision": return <Eye className="w-3 h-3" />;
            case "Reasoning": return <Network className="w-3 h-3" />;
            default: return <MessageSquare className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border border-zinc-800 bg-zinc-950 p-6 rounded-lg shadow-xl gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-bold text-zinc-100 tracking-tight font-sans">
                            Universal Model Abstraction Layer (UMAL)
                        </h2>
                        <span className="bg-indigo-950/60 text-indigo-400 border border-indigo-900/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                            CHAP 8
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                        Il livello UMAL astrae i modelli, i formati e i runtime dall'Orchestrator. 
                        Tutto il routing avviene per <strong>Capacità</strong> e non per nome del modello.
                        Include Intelligent Fallback, Prompt Normalization e Output Normalization.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refreshModels}
                        className="border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 text-xs font-mono p-1.5 rounded transition-all"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Model Registry */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 shadow-md">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-indigo-400" />
                                <h3 className="text-sm font-semibold text-zinc-200 font-sans uppercase tracking-wider">
                                    Model Capability Registry
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">{models.length} Modelli Indicizzati</span>
                        </div>

                        <div className="space-y-4">
                            {models.map(model => (
                                <div key={model.id} className="border border-zinc-800 bg-zinc-900/50 rounded-md p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-zinc-100 text-sm">{model.name}</h4>
                                                <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase">
                                                    {model.status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-zinc-500 font-mono mt-1">
                                                {model.family} • {model.format} ({model.quantization}) • {(model.sizeMb / 1024).toFixed(1)} GB
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-mono text-zinc-400">Context: <span className="text-zinc-200 font-bold">{model.maxContextTokens}</span></div>
                                            <div className="text-[10px] font-mono text-zinc-400">Speed: <span className="text-zinc-200 font-bold">{model.performance.speedTokensPerSec} t/s</span></div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h5 className="text-[9px] uppercase font-bold text-zinc-600 mb-1.5">Capacità Supportate (8.17)</h5>
                                        <div className="flex flex-wrap gap-1.5">
                                            {model.capabilities.map(cap => (
                                                <span key={cap} className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded text-[9px] font-mono">
                                                    {getCapabilityIcon(cap)}
                                                    {cap}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 shadow-md mt-6">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-sm font-semibold text-zinc-200 font-sans uppercase tracking-wider">
                                    Runtime & Model Adapters (8.7 - 8.8)
                                </h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase">Runtime Adapters</h4>
                                <div className="space-y-2">
                                    {Array.from(umal['runtimeAdapters'].values()).map((adapter: any) => (
                                        <div key={adapter.id} className="bg-zinc-900/50 border border-zinc-800 p-2 rounded flex items-center justify-between">
                                            <span className="text-xs font-mono text-zinc-300">{adapter.name}</span>
                                            <span className="text-[9px] text-zinc-500">[{adapter.supportedFormats.join(", ")}]</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase">Model Adapters</h4>
                                <div className="space-y-2">
                                    {Array.from(umal['modelAdapters'].values()).map((adapter: any) => (
                                        <div key={adapter.family} className="bg-zinc-900/50 border border-zinc-800 p-2 rounded flex items-center justify-between">
                                            <span className="text-xs font-mono text-zinc-300">{adapter.family}</span>
                                            <span className="text-[9px] text-zinc-500">[Template Converter]</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Simulator & Routing */}
                <div className="space-y-4">
                    <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 shadow-md flex flex-col h-full">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
                            <Zap className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-sm font-semibold text-zinc-200 font-sans uppercase tracking-wider">
                                Capability Based Router
                            </h3>
                        </div>

                        <form onSubmit={runUMALInference} className="space-y-4 flex-1 flex flex-col">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">1. Richiedi Capacità (8.6)</label>
                                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-zinc-900 border border-zinc-800 rounded">
                                    {availableCapabilities.map(cap => (
                                        <button
                                            key={cap}
                                            type="button"
                                            onClick={() => toggleCapability(cap)}
                                            className={`text-[9px] font-mono px-2 py-1 rounded border transition-all ${
                                                selectedCapabilities.includes(cap)
                                                ? "bg-indigo-900/60 text-indigo-300 border-indigo-700"
                                                : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600"
                                            }`}
                                        >
                                            {cap}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] text-zinc-600 italic">
                                    Seleziona le capacità richieste. UMAL sceglierà automaticamente il modello.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">2. Input Prompt</label>
                                <textarea
                                    value={testPrompt}
                                    onChange={e => setTestPrompt(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-300 font-mono text-xs h-20 resize-none focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isExecuting}
                                className="w-full mt-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-zinc-100 font-mono font-bold py-2 rounded transition-all flex items-center justify-center gap-2 text-xs"
                            >
                                {isExecuting ? <RotateCw className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
                                ESEGUI TRAMITE UMAL
                            </button>
                        </form>

                        {/* Results output */}
                        {testResult && (
                            <div className="mt-4 border-t border-zinc-900 pt-4">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">3. Output UMAL (8.10)</div>
                                {testResult.status === "Error" ? (
                                    <div className="bg-red-950/20 border border-red-900/40 p-3 rounded text-xs font-mono text-red-400 flex items-start gap-2">
                                        <ShieldAlert className="w-4 h-4 shrink-0" />
                                        <span>{testResult.data}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                            <span className="text-zinc-400">Modello Selezionato:</span>
                                            <span className="text-indigo-400 font-bold">{testResult.routedModel}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                            <span className="text-zinc-400">Latenza (UMAL overhead + inferenza):</span>
                                            <span className="text-emerald-400 font-bold">{testResult.data.latencyMs} ms</span>
                                        </div>
                                        <div className="bg-zinc-900 border border-zinc-800 rounded p-2.5 max-h-32 overflow-y-auto">
                                            <div className="text-[10px] font-mono text-zinc-300">
                                                {typeof testResult.data.content === "string" 
                                                    ? testResult.data.content 
                                                    : JSON.stringify(testResult.data.content, null, 2)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
