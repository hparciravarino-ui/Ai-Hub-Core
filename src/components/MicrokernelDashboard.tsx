import React, { useState, useEffect } from "react";
import {
    Activity,
    Cpu,
    Layers,
    Send,
    Zap,
    RotateCw,
    AlertTriangle,
    CheckCircle2,
    FileText,
    ShieldAlert,
    List,
    Plus,
    X,
    FileSignature,
    Check
} from "lucide-react";
import { EnterpriseServiceBus, ESBService, ESBMessage, LifecycleState, ESBMessagePriority } from "../../core/esb/EnterpriseServiceBus";

export default function MicrokernelDashboard() {
    const esb = EnterpriseServiceBus.getInstance();

    // Local Component State
    const [services, setServices] = useState<ESBService[]>([]);
    const [messageLogs, setMessageLogs] = useState<ESBMessage[]>([]);
    const [eventLogs, setEventLogs] = useState<any[]>([]);
    
    // Message routing input form
    const [selectedOrigin, setSelectedOrigin] = useState("Kernel");
    const [selectedDestination, setSelectedDestination] = useState("Scheduler");
    const [actionPayload, setActionPayload] = useState("processTask");
    const [messagePriority, setMessagePriority] = useState<ESBMessagePriority>("Normal");
    const [customPayloadData, setCustomPayloadData] = useState('{"taskId": "task-user-101"}');
    const [forceFailure, setForceFailure] = useState(false);
    const [lastRouteResult, setLastRouteResult] = useState<any>(null);

    // New service form modal state
    const [showNewServiceModal, setShowNewServiceModal] = useState(false);
    const [newServiceName, setNewServiceName] = useState("");
    const [newServiceVersion, setNewServiceVersion] = useState("1.0.0");
    const [newServiceDeps, setNewServiceDeps] = useState("Kernel");
    const [newServicePermissions, setNewServicePermissions] = useState("system:monitor,custom:compute");
    const [newServiceApis, setNewServiceApis] = useState("executeAction,analyzeContext");
    const [newServiceLicense, setNewServiceLicense] = useState<"Enterprise-MIT" | "Proprietary" | "AAGQA-Standard">("Enterprise-MIT");

    // Dependency graph simulation output
    const [dependencyReport, setDependencyReport] = useState<any>(null);
    const [simulatedCycle, setSimulatedCycle] = useState(false);

    // Initial load and updates polling
    useEffect(() => {
        refreshState();
        const interval = setInterval(() => {
            refreshState();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const refreshState = () => {
        setServices(esb.getServices());
        setMessageLogs([...esb.getMessageLog()].reverse());
        setEventLogs([...esb.getEventCatalog()].reverse());
        setDependencyReport(esb.analyzeDependencyGraph());
    };

    // Route interactive message through ESB
    const handleRouteMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setLastRouteResult(null);

        let parsedData = {};
        try {
            parsedData = JSON.parse(customPayloadData);
        } catch (err) {
            alert("Payload JSON non valido!");
            return;
        }

        const message: ESBMessage = {
            id: `msg-${Date.now()}`,
            correlationId: `corr-${Math.floor(Math.random() * 900000 + 100000)}`,
            origin: selectedOrigin,
            destination: selectedDestination,
            payload: {
                action: actionPayload,
                forceFail: forceFailure,
                data: parsedData
            },
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            priority: messagePriority,
            requiredPermissions: forceFailure ? ["system:super_admin"] : ["system:monitor"],
            timeoutMs: 5000,
            retryCount: 0,
            maxRetries: 3
        };

        try {
            const result = await esb.routeMessage(message);
            setLastRouteResult({
                status: "Success",
                result: result,
                timestamp: new Date().toLocaleTimeString()
            });
            refreshState();
        } catch (error: any) {
            setLastRouteResult({
                status: "Error",
                result: error.message,
                timestamp: new Date().toLocaleTimeString()
            });
            refreshState();
        }
    };

    // Dynamic Register Service
    const handleRegisterService = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newServiceName.trim()) return;

        const service: ESBService = {
            contract: {
                id: `srv-${newServiceName.toLowerCase()}-${Math.floor(Math.random() * 9000)}`,
                name: newServiceName,
                version: newServiceVersion,
                dependencies: newServiceDeps.split(",").map(d => d.trim()).filter(Boolean),
                permissions: newServicePermissions.split(",").map(p => p.trim()).filter(Boolean),
                supportedEvents: ["TaskTriggered", "StateUpdated"],
                apis: newServiceApis.split(",").map(a => a.trim()).filter(Boolean),
                license: newServiceLicense,
                checksum: `0x${Math.floor(Math.random() * 1000000000).toString(16).toUpperCase()}`,
                digitalSignature: `SIG_${Math.floor(Math.random() * 900000)}_DYNAMIC`
            },
            state: "Running",
            telemetry: {
                cpuPercent: parseFloat((Math.random() * 3).toFixed(1)),
                ramMb: parseFloat((Math.random() * 50 + 15).toFixed(1)),
                vramMb: 0,
                threadsCount: Math.floor(Math.random() * 5 + 1),
                errorCount: 0,
                totalRequests: 0,
                averageResponseTimeMs: parseFloat((Math.random() * 15 + 2).toFixed(1)),
                uptimeSeconds: 0,
                documentationScore: 90,
                testQualityScore: 85
            },
            bootstrapTimeMs: Math.floor(Math.random() * 80 + 10),
            lastStateChange: new Date().toISOString()
        };

        esb.registerService(service);
        setShowNewServiceModal(false);
        setNewServiceName("");
        refreshState();
    };

    // Dynamic Hot Reload
    const handleHotReload = async (name: string) => {
        try {
            await esb.hotReloadService(name);
            refreshState();
        } catch (err: any) {
            alert(`Hot Reload fallito: ${err.message}`);
        }
    };

    // Simulated Circular Dependency injection to verify architectural self-check (7.10)
    const toggleCircularDependencySimulation = () => {
        if (!simulatedCycle) {
            // Introduce dummy circular modules
            const srvA: ESBService = {
                contract: {
                    id: "srv-loop-a",
                    name: "AIOrchestratorKernel",
                    version: "1.0.0",
                    dependencies: ["ModelManagerService"],
                    permissions: [],
                    supportedEvents: [],
                    apis: [],
                    license: "AAGQA-Standard",
                    checksum: "0xABC123",
                    digitalSignature: "SIG_LOOP_A"
                },
                state: "Running",
                telemetry: { cpuPercent: 0, ramMb: 1, vramMb: 0, threadsCount: 1, errorCount: 0, totalRequests: 0, averageResponseTimeMs: 0, uptimeSeconds: 1, documentationScore: 100, testQualityScore: 100 },
                bootstrapTimeMs: 5,
                lastStateChange: new Date().toISOString()
            };

            const srvB: ESBService = {
                contract: {
                    id: "srv-loop-b",
                    name: "ModelManagerService",
                    version: "1.0.0",
                    dependencies: ["AIOrchestratorKernel"],
                    permissions: [],
                    supportedEvents: [],
                    apis: [],
                    license: "AAGQA-Standard",
                    checksum: "0xDEF456",
                    digitalSignature: "SIG_LOOP_B"
                },
                state: "Running",
                telemetry: { cpuPercent: 0, ramMb: 1, vramMb: 0, threadsCount: 1, errorCount: 0, totalRequests: 0, averageResponseTimeMs: 0, uptimeSeconds: 1, documentationScore: 100, testQualityScore: 100 },
                bootstrapTimeMs: 5,
                lastStateChange: new Date().toISOString()
            };

            esb.registerService(srvA);
            esb.registerService(srvB);
            setSimulatedCycle(true);
            refreshState();
        } else {
            // Remove loop services
            // @ts-ignore
            esb.services.delete("aiorchestratorkernel");
            // @ts-ignore
            esb.services.delete("modelmanagerservice");
            setSimulatedCycle(false);
            refreshState();
        }
    };

    // Calculate colors based on service states
    const getStateBadgeColor = (state: LifecycleState) => {
        switch (state) {
            case "Running":
                return "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40";
            case "Initializing":
            case "Loading":
                return "bg-amber-950/40 text-amber-400 border border-amber-900/40";
            case "Stopping":
            case "Stopped":
                return "bg-zinc-900 text-zinc-400 border border-zinc-800";
            case "Restarting":
            case "Recovering":
                return "bg-purple-950/40 text-purple-400 border border-purple-900/40";
            case "Failed":
                return "bg-red-950/40 text-red-400 border border-red-900/40";
            default:
                return "bg-zinc-900 text-zinc-400 border border-zinc-800";
        }
    };

    // Determine health color classes
    const getHealthColor = (score: number) => {
        if (score >= 90) return "text-emerald-400";
        if (score >= 75) return "text-amber-400";
        return "text-red-400";
    };

    return (
        <div className="space-y-6" id="esb-microkernel-dashboard-container">
            {/* Upper Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border border-zinc-800 bg-zinc-950 p-6 rounded-lg shadow-xl gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-bold text-zinc-100 tracking-tight font-sans">
                            AI Microkernel & Enterprise Service Bus
                        </h2>
                        <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                            CHAP 7
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                        Il Microkernel gestisce l'isolamento dei moduli e i contratti stabili. Tutte le comunicazioni interne, 
                        sincrone o asincrone, transitano obbligatoriamente attraverso l'Enterprise Service Bus (ESB) garantendo 
                        disaccoppiamento, isolamento dei crash e auto-recovery L1-L6.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowNewServiceModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold font-mono px-3.5 py-1.5 rounded transition-all flex items-center gap-1.5 shadow"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        DYNAMIC REGISTRATION
                    </button>
                    <button
                        onClick={refreshState}
                        className="border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 text-xs font-mono p-1.5 rounded transition-all"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Middle Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Dynamic Service Registry View */}
                <div className="lg:col-span-2 border border-zinc-800 bg-zinc-950 rounded-lg p-5 space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                            <h3 className="text-sm font-semibold text-zinc-200 font-sans uppercase tracking-wider">
                                Active Service Registry
                            </h3>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                            Count: {services.length} moduli attivi
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-900 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                    <th className="py-2.5">Modulo / ID</th>
                                    <th>Versione</th>
                                    <th>Stato</th>
                                    <th>Health Score</th>
                                    <th>Telemetry (CPU/RAM)</th>
                                    <th className="text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 text-xs">
                                {services.map((srv) => {
                                    const healthScore = esb.calculateHealthScore(srv);
                                    return (
                                        <tr key={srv.contract.id} className="hover:bg-zinc-900/30 group">
                                            <td className="py-3">
                                                <div className="font-semibold text-zinc-200">{srv.contract.name}</div>
                                                <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
                                                    <span>{srv.contract.id}</span>
                                                    <span>•</span>
                                                    <span className="text-zinc-600 flex items-center gap-1" title="Licenza e firma digitale">
                                                        <FileSignature className="w-2.5 h-2.5" />
                                                        {srv.contract.license}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-zinc-400 font-mono">v{srv.contract.version}</td>
                                            <td>
                                                <span className={`inline-block text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${getStateBadgeColor(srv.state)}`}>
                                                    {srv.state}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-mono font-bold ${getHealthColor(healthScore)}`}>
                                                        {healthScore}%
                                                    </span>
                                                    <div className="w-12 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${healthScore >= 90 ? 'bg-emerald-500' : healthScore >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${healthScore}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-mono text-zinc-400 text-[11px]">
                                                <div>CPU: <span className="text-zinc-300">{srv.telemetry.cpuPercent}%</span></div>
                                                <div>RAM: <span className="text-zinc-300">{srv.telemetry.ramMb.toFixed(1)} MB</span></div>
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => handleHotReload(srv.contract.name)}
                                                    className="opacity-0 group-hover:opacity-100 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] font-mono px-2 py-1 rounded transition-all"
                                                    title="Hot swap / reload service without system interruption"
                                                >
                                                    HOT SWAP
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Microkernel Dependency Graph Diagnostics */}
                <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 space-y-4 shadow-md flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-sm font-semibold text-zinc-200 font-sans uppercase tracking-wider">
                                    Dependency Chain Analysis
                                </h3>
                            </div>
                        </div>

                        {/* Interactive Graph Simulation State */}
                        <div className="p-3.5 bg-zinc-900/40 rounded border border-zinc-850 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-mono text-zinc-400">Verifica Dipendenze:</span>
                                <button
                                    onClick={toggleCircularDependencySimulation}
                                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-all ${
                                        simulatedCycle 
                                            ? "bg-red-950/60 text-red-400 border-red-900/60" 
                                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800"
                                    }`}
                                >
                                    {simulatedCycle ? "RIMUOVI CICLO" : "SIMULA DIPENDENZA CIRCOLARE"}
                                </button>
                            </div>

                            {dependencyReport && (
                                <div className="space-y-2">
                                    {dependencyReport.isValid ? (
                                        <div className="flex items-start gap-2 text-emerald-400 text-xs">
                                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold">Nessuna anomalia riscontrata</div>
                                                <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                                                    Il grafo delle dipendenze è pulito. L'ordine di bootstrap risolto è:
                                                    <span className="block font-mono text-emerald-300 mt-1 font-semibold text-[10px] bg-zinc-950 p-1 rounded border border-zinc-900">
                                                        {dependencyReport.resolvedOrder.join(" → ")}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2 text-red-400 text-xs">
                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold">BLOCCO AVVIO: Grafo non valido!</div>
                                                <ul className="text-[10px] text-zinc-400 list-disc pl-4 space-y-1 mt-1">
                                                    {dependencyReport.errors.map((err: string, idx: number) => (
                                                        <li key={idx} className="text-red-300 font-mono font-semibold">{err}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stable Service Contracts visual specs */}
                        <div className="space-y-2">
                            <h4 className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                                Service Contracts (Contratti Pubblici)
                            </h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                                Ciascun modulo espone esclusivamente contratti pubblici e interfacce API stabili. È vietato 
                                l'accesso diretto alla logica interna per garantire isolamento e future estensioni.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-3">
                        <div className="bg-emerald-950/25 border border-emerald-900/30 p-2.5 rounded text-[10px] text-emerald-400 leading-relaxed font-mono">
                            <span className="font-bold">MICROKERNEL ISOLATION:</span> Il nucleo si avvia anche in assenza di alcun plugin AI. Nessuna dipendenza forte con i database o runtime esterni.
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower ESB Messaging Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 3. Interactive ESB Message Router */}
                <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 space-y-4 shadow-md flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                            <Send className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-semibold text-zinc-200 font-sans uppercase tracking-wider">
                                Interactive ESB Router
                            </h3>
                        </div>

                        <form onSubmit={handleRouteMessage} className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Sorgente (Origin)</label>
                                    <select
                                        value={selectedOrigin}
                                        onChange={(e) => setSelectedOrigin(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                                    >
                                        {services.map(s => (
                                            <option key={s.contract.id} value={s.contract.name}>{s.contract.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Destinatario (Dest)</label>
                                    <select
                                        value={selectedDestination}
                                        onChange={(e) => setSelectedDestination(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                                    >
                                        {services.map(s => (
                                            <option key={s.contract.id} value={s.contract.name}>{s.contract.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">API Action</label>
                                    <input
                                        type="text"
                                        value={actionPayload}
                                        onChange={(e) => setActionPayload(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Coda Priorità</label>
                                    <select
                                        value={messagePriority}
                                        onChange={(e) => setMessagePriority(e.target.value as ESBMessagePriority)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                                    >
                                        <option value="High">High Priority</option>
                                        <option value="Normal">Normal</option>
                                        <option value="Background">Background</option>
                                        <option value="Low">Low Priority</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Payload Data (JSON)</label>
                                <textarea
                                    value={customPayloadData}
                                    onChange={(e) => setCustomPayloadData(e.target.value)}
                                    rows={2}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono text-[11px] h-12"
                                />
                            </div>

                            {/* Fault Isolation Toggle (7.14) */}
                            <div className="flex items-center gap-2 p-2 bg-red-950/15 border border-red-900/20 rounded">
                                <input
                                    type="checkbox"
                                    id="force-fail-chk"
                                    checked={forceFailure}
                                    onChange={(e) => setForceFailure(e.target.checked)}
                                    className="accent-red-500 rounded"
                                />
                                <label htmlFor="force-fail-chk" className="text-red-300 font-mono text-[10px] leading-snug cursor-pointer select-none">
                                    Forza crash d'inferenza (Fault Isolation & Auto-Recovery)
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono font-bold py-2 rounded transition-all text-center flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4 text-zinc-950" />
                                INVIA PACCHETTO ESB
                            </button>
                        </form>
                    </div>

                    {/* Routing Output Log */}
                    {lastRouteResult && (
                        <div className="border-t border-zinc-900 pt-3 mt-3 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="text-zinc-500">Output Router:</span>
                                <span className={lastRouteResult.status === "Success" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                                    {lastRouteResult.status}
                                </span>
                            </div>
                            <pre className="bg-zinc-900 p-2.5 rounded text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-24">
                                {typeof lastRouteResult.result === "object" 
                                    ? JSON.stringify(lastRouteResult.result, null, 2) 
                                    : lastRouteResult.result}
                            </pre>
                            <span className="block text-[8px] text-right font-mono text-zinc-600">
                                {lastRouteResult.timestamp}
                            </span>
                        </div>
                    )}
                </div>

                {/* 4. ESB Audit Trace (Tracciabilità & Osservabilità 7.5) */}
                <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 space-y-4 shadow-md flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                            <List className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-semibold text-zinc-200 font-sans uppercase tracking-wider">
                                ESB Audit Trace
                            </h3>
                        </div>

                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {messageLogs.length === 0 ? (
                                <p className="text-[11px] text-zinc-500 italic text-center py-6 font-mono">
                                    Nessun pacchetto transitato nell'ESB.
                                </p>
                            ) : (
                                messageLogs.map((log) => (
                                    <div key={log.id} className="p-2 bg-zinc-900/60 rounded border border-zinc-850 space-y-1 text-[10px]">
                                        <div className="flex items-center justify-between font-mono">
                                            <span className="text-emerald-400 font-bold uppercase">[{log.priority}]</span>
                                            <span className="text-zinc-500 text-[9px]">{log.correlationId}</span>
                                        </div>
                                        <div className="text-zinc-300 font-mono">
                                            <span className="text-zinc-400">{log.origin}</span> → <span className="text-zinc-400 font-bold">{log.destination}</span>
                                        </div>
                                        <div className="text-[9px] text-zinc-500 font-mono leading-relaxed mt-1 bg-zinc-950 p-1 rounded border border-zinc-900">
                                            Action: <span className="text-amber-400 font-bold">{log.payload?.action}</span>
                                            {log.payload?.forceFail && <span className="text-red-400 ml-1 font-bold">[FAILURE_INJECTED]</span>}
                                        </div>
                                        <div className="text-[8px] text-zinc-600 text-right mt-0.5">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-3">
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                            TRACCIABILITÀ COMPLETA: Tutti i messaggi possiedono ID univoci, Correlation ID, timestamp e controlli di integrità di sicurezza.
                        </p>
                    </div>
                </div>

                {/* 5. Live Event Catalog (7.12) */}
                <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 space-y-4 shadow-md flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-semibold text-zinc-200 font-sans uppercase tracking-wider">
                                Dynamic Event Catalog
                            </h3>
                        </div>

                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {eventLogs.length === 0 ? (
                                <p className="text-[11px] text-zinc-500 italic text-center py-6 font-mono">
                                    Nessun evento registrato nel catalogo.
                                </p>
                            ) : (
                                eventLogs.map((evt, idx) => (
                                    <div key={idx} className="p-2 bg-zinc-900/60 rounded border border-zinc-850 space-y-1 text-[10px]">
                                        <div className="flex items-center justify-between font-mono">
                                            <span className="text-zinc-200 font-semibold">{evt.payloadSchemaName}</span>
                                            <span className="text-emerald-500 bg-emerald-950/40 border border-emerald-900/40 text-[8px] font-mono px-1 py-0.2 rounded font-bold uppercase">
                                                {evt.priority}
                                            </span>
                                        </div>
                                        <div className="text-zinc-400 font-mono text-[9px]">
                                            Source: <span className="text-zinc-300 font-semibold">{evt.origin}</span>
                                        </div>
                                        <div className="text-zinc-500 text-[8px] font-mono mt-0.5">
                                            ID: {evt.eventId} • {new Date(evt.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-3">
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                            EVENT PUBLISHING: I moduli pubblicano eventi asincroni che altri moduli sottoscrivono liberamente.
                        </p>
                    </div>
                </div>

            </div>

            {/* Dynamic Service Registration Modal */}
            {showNewServiceModal && (
                <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl relative">
                        <button
                            onClick={() => setShowNewServiceModal(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 uppercase font-sans tracking-wide">
                                <Plus className="w-4 h-4 text-emerald-400" />
                                Dynamic Registry Enrollment
                            </h3>
                            <p className="text-[11px] text-zinc-400">
                                Inserisci un nuovo servizio/plugin nel Service Registry dell'ESB in tempo reale (Hot Reload).
                            </p>
                        </div>

                        <form onSubmit={handleRegisterService} className="space-y-3.5 text-xs">
                            <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold text-[10px]">Nome Modulo (PascalCase)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="E.g., KnowledgeRetrievalPlugin"
                                    value={newServiceName}
                                    onChange={(e) => setNewServiceName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-zinc-400 font-semibold text-[10px]">Versione</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="1.0.0"
                                        value={newServiceVersion}
                                        onChange={(e) => setNewServiceVersion(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-400 font-semibold text-[10px]">Licenza Enterprise</label>
                                    <select
                                        value={newServiceLicense}
                                        onChange={(e) => setNewServiceLicense(e.target.value as any)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
                                    >
                                        <option value="Enterprise-MIT">Enterprise-MIT</option>
                                        <option value="Proprietary">Proprietary</option>
                                        <option value="AAGQA-Standard">AAGQA-Standard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold text-[10px]">Dipendenze (nomi separati da virgola)</label>
                                <input
                                    type="text"
                                    placeholder="Kernel, SecurityEngine"
                                    value={newServiceDeps}
                                    onChange={(e) => setNewServiceDeps(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold text-[10px]">Permessi Sandbox espliciti</label>
                                <input
                                    type="text"
                                    placeholder="system:monitor, api:read"
                                    value={newServicePermissions}
                                    onChange={(e) => setNewServicePermissions(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold text-[10px]">API Pubbliche esposte</label>
                                <input
                                    type="text"
                                    placeholder="queryVectors, clearIndex"
                                    value={newServiceApis}
                                    onChange={(e) => setNewServiceApis(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono font-bold py-2.5 rounded transition-all text-center flex items-center justify-center gap-1.5"
                                >
                                    <Check className="w-4 h-4" />
                                    REGISTRA NEL MICROKERNEL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
