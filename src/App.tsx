import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Database,
  Sliders,
  Cpu,
  ListOrdered,
  Blocks,
  ShieldCheck,
  ChevronRight,
  Brain,
  Info,
  Server,
  Download,
  AlertTriangle,
  Settings,
  X,
  MessageSquare,
  Folder,
  BookOpen,
  Layers,
  Network,
} from "lucide-react";
import { HardwareProfile, Model, Plugin, AuditLog, PerformanceProfileId } from "./types";
import { HARDWARE_PRESETS, MODEL_CATALOG, PLUGINS_LIST, SECURITY_LOGS, PERFORMANCE_PROFILES } from "./data";
import { detectActualHardware } from "./utils";
import Dashboard from "./components/Dashboard";
import ModelManager from "./components/ModelManager";
import Optimizer from "./components/Optimizer";
import AIAssistant from "./components/AIAssistant";
import { diagnoseAPI } from "./apiClient";
import ProfessionalChat from "./components/ProfessionalChat";
import Scheduler from "./components/Scheduler";
import PluginCenter from "./components/PluginCenter";
import SecurityCenter from "./components/SecurityCenter";
import ProjectAnalyzer from "./components/ProjectAnalyzer";
import AIOrchestratorDashboard from "./components/AIOrchestratorDashboard";
import UserGuide from "./components/UserGuide";
import GovernanceCenter from "./components/GovernanceCenter";
import MicrokernelDashboard from "./components/MicrokernelDashboard";
import UMALDashboard from "./components/UMALDashboard";
import IHALDashboard from "./components/IHALDashboard";
import { getAuthHeaders } from "./utils";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>("custom");
  const [currentHardware, setCurrentHardware] = useState<HardwareProfile>({
    id: "custom",
    name: "Rilevamento in corso...",
    cpu: "Rilevazione automatica CPU...",
    gpu: "Rilevazione automatica GPU...",
    ram: 8,
    vram: 0.5,
    cores: 4,
    threads: 4,
    storageType: "SSD",
    freeSpace: 120,
    temperature: 42,
    loadCpu: 5,
    loadGpu: 0,
    loadRam: 35,
    loadVram: 0,
  });
  const [selectedProfileId, setSelectedProfileId] = useState<PerformanceProfileId>("balanced");
  const [models, setModels] = useState<Model[]>(() => {
    try {
      const saved = localStorage.getItem("ai_hub_models");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse initial models:", e);
    }
    return MODEL_CATALOG;
  });

  // Save models to LocalStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("ai_hub_models", JSON.stringify(models));
    } catch (e) {
      console.error("Failed to save models to localStorage:", e);
    }
  }, [models]);

  const handleAddNewModel = (newModel: Model) => {
    setModels((prev) => {
      if (prev.some((m) => m.id === newModel.id)) {
        addAuditLog("System", `Modello '${newModel.name}' già presente nel catalogo`, "Warning");
        return prev;
      }
      addAuditLog("System", `Nuovo modello '${newModel.name}' registrato nel catalogo online`, "Success");
      return [...prev, newModel];
    });
  };

  const [plugins, setPlugins] = useState<Plugin[]>(PLUGINS_LIST);
  const [logs, setLogs] = useState<AuditLog[]>(SECURITY_LOGS);
  const [offlineOnly, setOfflineOnly] = useState<boolean>(true);
  const [downloadSpeed, setDownloadSpeed] = useState<"standard" | "turbo" | "instant">("turbo");
  const [diagnosticsText, setDiagnosticsText] = useState<string>("");
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);

  // Status logs helper
  const addAuditLog = (type: "Security" | "Inference" | "System" | "Privacy", action: string, status: "Success" | "Blocked" | "Warning" = "Success") => {
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      type,
      action,
      status,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Hardware detection via API
  useEffect(() => {
    const checkHardware = async () => {
      try {
        const response = await fetch("/api/hardware");
        const data = await response.json();
        
        // Use the returned hardware status
        const detectedProfile: HardwareProfile = {
          id: "custom",
          name: `Rilevamento Backend (OS: ${data.profile?.os || 'Sconosciuto'})`,
          cpu: `Architettura: ${data.profile?.arch || 'N/A'}`,
          gpu: data.profile?.gpu || "N/A",
          ram: data.profile?.totalMem ? Math.round(data.profile.totalMem / (1024*1024*1024)) : 8,
          vram: 0.5,
          cores: data.profile?.cpuCores || 4,
          threads: data.profile?.cpuCores || 4,
          storageType: "SSD",
          freeSpace: 150,
          temperature: 45,
          loadCpu: 0,
          loadGpu: 0,
          loadRam: 0,
          loadVram: 0,
        };

        setSelectedHardwareId("custom");
        setCurrentHardware(detectedProfile);
        addAuditLog("System", `Hardware rilevato dal backend Node.js reale`, "Success");
      } catch (e) {
        console.error("Hardware detection API failed:", e);
      }
    };
    checkHardware();
  }, []);

  // Switch physical hardware profile preset
  const handleHardwareChange = (hardwareId: string) => {
    const preset = HARDWARE_PRESETS.find((h) => h.id === hardwareId);
    if (preset) {
      setSelectedHardwareId(hardwareId);
      setCurrentHardware(preset);
      addAuditLog("System", `Configurazione hardware modificata in: ${preset.name}`, "Success");
      // Clear previous custom diagnostics report
      setDiagnosticsText("");
    }
  };

  // Handle custom hardware specifications entered manually
  const handleCustomHardwareUpdate = (customProfile: HardwareProfile) => {
    setSelectedHardwareId("custom");
    setCurrentHardware(customProfile);
    addAuditLog("System", `Specifiche hardware configurate manualmente: ${customProfile.name}`, "Success");
    setDiagnosticsText("");
  };

  // Switch operating performance profile
  const handleProfileChange = (profileId: PerformanceProfileId) => {
    setSelectedProfileId(profileId);
    const profileName = PERFORMANCE_PROFILES.find((p) => p.id === profileId)?.name || profileId;
    addAuditLog("System", `Profilo operativo cambiato in: ${profileName}`, "Success");
  };

  const handleDownloadModel = async (modelId: string) => {
    try {
      const response = await fetch("/api/models/download", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        addAuditLog("System", `Operazione bloccata: ${data.error || "Non implementata"}`, "Blocked");
        alert(`Errore Architetturale: ${data.error}`);
        return;
      }
    } catch (e) {
      addAuditLog("System", `Errore di rete`, "Blocked");
    }
  };

  const handleDeleteModel = (modelId: string) => {
    alert("Eliminazione modelli non implementata (Fase 9).");
  };

  const handleDownloadAllModels = () => {
    alert("Operazione bloccata: Download multiplo non implementato.");
  };

  const handleDeleteAllModels = () => {
    alert("Operazione bloccata: Rimozione multipla non implementata.");
  };

  // Toggle dynamic plugin installs
  const handleTogglePlugin = (pluginId: string) => {
    alert("Gestione plugin bloccata in attesa di Fase 16 (Plugin Engine).");
  };

  // Toggle offline only privacy protection
  const handleToggleOffline = () => {
    const nextState = !offlineOnly;
    setOfflineOnly(nextState);
    addAuditLog(
      "Privacy",
      nextState ? "Connessione internet disattivata (Esecuzione offline al 100%)" : "Abilitata rete ibrida per cataloghi e sync opzionale",
      nextState ? "Success" : "Warning"
    );
  };

  // AI-Powered Diagnostics call using the Gemini Express Backend
  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    setDiagnosticsText("");
    addAuditLog("Inference", "Richiesto report diagnostico hardware con l'AI Advisor", "Success");

    try {
      const text = await diagnoseAPI(currentHardware, selectedProfileId);
      setDiagnosticsText(text);
      addAuditLog("Inference", "Generazione report diagnostico completata dall'Advisor", "Success");
    } catch (err: any) {
      console.error(err);
      setDiagnosticsText(
        "### Diagnosi Manuale Fallita\n\n- **Causa:** Impossibile contattare l'Inference Engine locale dell'AI Hub.\n- **Raccomandazione standard:** Con l'hardware selezionato (RAM: " +
          currentHardware.ram +
          "GB), ti consigliamo di utilizzare modelli sotto i 3B di parametri (es: Llama-3.2 3B Q4_K_M) e attivare lo Swap su SSD."
      );
      addAuditLog("System", "Risoluzione diagnostica fallita per disconnessione client", "Blocked");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const activeProfile = PERFORMANCE_PROFILES.find((p) => p.id === selectedProfileId) || PERFORMANCE_PROFILES[1];

  return (
    <div className="min-h-screen bg-appbg text-zinc-200 flex flex-col font-sans" id="app-root">
      {/* Top Header Panel */}
      <header className="bg-barbg border-b border-zinc-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0" id="app-header">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-black font-extrabold text-[10px]">AI</div>
            <h1 className="text-base font-bold font-display tracking-tight text-zinc-50 flex items-center gap-1.5">
              AI HUB <span className="text-emerald-500">CORE</span> <span className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.2 rounded font-mono uppercase">OpenSource v1.0.4</span>
            </h1>
          </div>
          <p className="text-[11px] text-zinc-500">
            Esecuzione e installazione intelligente di modelli AI locali su hardware di fascia bassa e media.
          </p>
        </div>

        {/* Global Stats indicators on Header */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono" id="header-stats">
          <div className="flex items-center space-x-1.5 bg-appbg px-3 py-1.5 rounded border border-zinc-800">
            <Server className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-zinc-500">Rete:</span>
            <span className={offlineOnly ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
              {offlineOnly ? "100% OFFLINE" : "IBRIDA SYNC"}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-appbg px-3 py-1.5 rounded border border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-zinc-500">Hardware:</span>
            <span className="text-sky-300 font-bold truncate max-w-[150px]">
              {currentHardware.name}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-appbg px-3 py-1.5 rounded border border-zinc-800">
            <Settings className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-500">Profilo:</span>
            <span className="text-violet-400 font-bold uppercase">{activeProfile.name}</span>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Central Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Rails */}
        <aside className="w-64 bg-barbg border-r border-zinc-800 p-4 flex flex-col justify-between shrink-0 overflow-y-auto" id="sidebar-navigation">
          <div className="space-y-6">
            <div className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest pl-2">
              Menu Principale
            </div>

            <nav className="space-y-1" id="navigation-list">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "dashboard"
                    ? "bg-zinc-800/60 text-white border-l-2 border-emerald-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span>Pannello di Controllo</span>
              </button>

              <button
                onClick={() => setActiveTab("models")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "models"
                    ? "bg-zinc-800/60 text-white border-l-2 border-emerald-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                <span className="flex-1 text-left">Gestione Modelli</span>
                {models.filter((m) => m.downloaded).length > 0 && (
                  <span className="bg-sky-950 text-sky-400 text-[9px] font-mono font-bold border border-sky-900 px-1.5 py-0.2 rounded">
                    {models.filter((m) => m.downloaded).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("optimizer")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "optimizer"
                    ? "bg-zinc-800/60 text-white border-l-2 border-emerald-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Ottimizzazione Hardware</span>
              </button>

              <button
                onClick={() => setActiveTab("assistant")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "assistant"
                    ? "bg-zinc-800/60 text-white border-l-2 border-emerald-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                <span>Playground & AI Tools</span>
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "chat"
                    ? "bg-zinc-800/60 text-emerald-400 border-l-2 border-emerald-500 font-bold"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="flex-1 text-left">Sistema Chat Pro</span>
                <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-mono font-bold border border-emerald-900/60 px-1.5 py-0.2 rounded">
                  NEW
                </span>
              </button>

              <button
                onClick={() => setActiveTab("analyzer")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "analyzer"
                    ? "bg-zinc-800/60 text-emerald-400 border-l-2 border-emerald-500 font-bold"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <Folder className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="flex-1 text-left">Analisi Progetto</span>
                <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-mono font-bold border border-emerald-900/60 px-1.5 py-0.2 rounded">
                  AI
                </span>
              </button>

              <button
                onClick={() => setActiveTab("orchestrator")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "orchestrator"
                    ? "bg-zinc-800/60 text-emerald-400 border-l-2 border-emerald-500 font-bold"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <Brain className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="flex-1 text-left">AI Orchestrator Kernel</span>
                <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-mono font-bold border border-emerald-900/60 px-1.5 py-0.2 rounded">
                  CHAP 6
                </span>
              </button>

              <button
                onClick={() => setActiveTab("scheduler")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "scheduler"
                    ? "bg-zinc-800/60 text-white border-l-2 border-emerald-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <span>Scheduler Coda</span>
              </button>

              <button
                onClick={() => setActiveTab("plugins")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "plugins"
                    ? "bg-zinc-800/60 text-white border-l-2 border-emerald-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <Blocks className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <span>Plugin Estensioni</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "security"
                    ? "bg-zinc-800/60 text-white border-l-2 border-emerald-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <span>Sicurezza & Privacy</span>
              </button>

              <button
                onClick={() => setActiveTab("governance")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "governance"
                    ? "bg-zinc-800/60 text-emerald-400 border-l-2 border-emerald-500 font-bold"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span className="flex-1 text-left">Governance & QA</span>
                <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-mono font-bold border border-emerald-900/60 px-1.5 py-0.2 rounded">
                  AAGQA
                </span>
              </button>

              <button
                onClick={() => setActiveTab("microkernel")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "microkernel"
                    ? "bg-zinc-800/60 text-emerald-400 border-l-2 border-emerald-500 font-bold"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="flex-1 text-left">Microkernel & ESB</span>
                <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-mono font-bold border border-emerald-900/60 px-1.5 py-0.2 rounded">
                  CHAP 7
                </span>
              </button>

              <button
                onClick={() => setActiveTab("umal")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "umal"
                    ? "bg-zinc-800/60 text-indigo-400 border-l-2 border-indigo-500 font-bold"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <Network className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span className="flex-1 text-left">UMAL Abstraction Layer</span>
                <span className="bg-indigo-950/60 text-indigo-400 text-[8px] font-mono font-bold border border-indigo-900/60 px-1.5 py-0.2 rounded">
                  CHAP 8
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ihal")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "ihal"
                    ? "bg-zinc-800/60 text-amber-400 border-l-2 border-amber-500 font-bold"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span className="flex-1 text-left">IHAL Abstraction Layer</span>
                <span className="bg-amber-950/60 text-amber-400 text-[8px] font-mono font-bold border border-amber-900/60 px-1.5 py-0.2 rounded">
                  CHAP 9
                </span>
              </button>

              <button
                onClick={() => setActiveTab("guide")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === "guide"
                    ? "bg-zinc-800/60 text-white border-l-2 border-emerald-500"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                <span>Guida all'Uso</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer banner */}
          <div className="pt-4 mt-6 border-t border-zinc-850 text-[11px] text-zinc-500 space-y-2 bg-emerald-950/5 p-3 rounded" id="sidebar-footer">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">System Assistant</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight italic">
              "Switching to Llama-3-8B-Q4_K_M for optimal 8GB RAM performance."
            </p>
          </div>
        </aside>

        {/* Central View Content Window */}
        <main className="flex-1 bg-appbg p-6 overflow-y-auto" id="central-view-viewport">
          {activeTab === "dashboard" && (
            <Dashboard
              currentHardware={currentHardware}
              selectedProfileId={selectedProfileId}
              onProfileChange={handleProfileChange}
              installedModelsCount={models.filter((m) => m.downloaded).length}
            />
          )}

          {activeTab === "guide" && <UserGuide />}

          {activeTab === "models" && (
            <ModelManager
              currentHardware={currentHardware}
              models={models}
              onDownloadModel={handleDownloadModel}
              onDeleteModel={handleDeleteModel}
              downloadSpeed={downloadSpeed}
              onDownloadSpeedChange={setDownloadSpeed}
              onDownloadAll={handleDownloadAllModels}
              onDeleteAll={handleDeleteAllModels}
              onAddNewModel={handleAddNewModel}
            />
          )}

          {activeTab === "optimizer" && (
            <Optimizer
              currentHardware={currentHardware}
              selectedHardwareId={selectedHardwareId}
              onHardwareChange={handleHardwareChange}
              selectedProfileId={selectedProfileId}
              onDiagnose={handleDiagnose}
              diagnosticsText={diagnosticsText}
              isDiagnosing={isDiagnosing}
              onCustomHardwareUpdate={handleCustomHardwareUpdate}
            />
          )}

          {activeTab === "assistant" && (
            <AIAssistant
              availableModels={models}
              selectedProfileId={selectedProfileId}
              currentHardware={currentHardware}
              onDownloadModel={handleDownloadModel}
              onDeleteModel={handleDeleteModel}
            />
          )}

          {activeTab === "chat" && (
            <ProfessionalChat
              availableModels={models}
              selectedProfileId={selectedProfileId}
              currentHardware={currentHardware}
              onDownloadModel={handleDownloadModel}
              onDeleteModel={handleDeleteModel}
            />
          )}

          {activeTab === "analyzer" && (
            <ProjectAnalyzer />
          )}

          {activeTab === "orchestrator" && (
            <AIOrchestratorDashboard />
          )}

          {activeTab === "scheduler" && <Scheduler />}

          {activeTab === "plugins" && <PluginCenter plugins={plugins} onTogglePlugin={handleTogglePlugin} />}

          {activeTab === "security" && (
            <SecurityCenter
              logs={logs}
              offlineOnly={offlineOnly}
              onToggleOffline={handleToggleOffline}
            />
          )}

          {activeTab === "governance" && (
            <GovernanceCenter />
          )}

          {activeTab === "microkernel" && (
            <MicrokernelDashboard />
          )}

          {activeTab === "umal" && (
            <UMALDashboard />
          )}

          {activeTab === "ihal" && (
            <IHALDashboard />
          )}
        </main>
      </div>

      {/* Persistent global warning/status ticker */}
      {models.some((m) => m.isDownloading) && (
        <div className="bg-emerald-950/80 border-t border-emerald-900 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-300 font-mono" id="persistent-download-banner">
          <div className="flex items-center space-x-2 truncate">
            <Download className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
            <span className="truncate">
              Download locale del modello in corso... Sincronizzazione segmenti sul disco in sandbox locale.
            </span>
          </div>
          <div className="shrink-0 flex items-center space-x-3 ml-4">
            <span className="font-bold">
              {models.find((m) => m.isDownloading)?.downloadProgress}%
            </span>
          </div>
        </div>
      )}

      {/* Elegant Dark Footer Metrics Bar */}
      <footer className="h-10 bg-barbg border-t border-zinc-800 px-6 flex items-center justify-between font-mono text-[9px] text-zinc-500" id="app-footer-metrics">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> ENGINE ACTIVE
          </span>
          <span>CORE TEMP: 54°C</span>
          <span>DISK: 124GB FREE</span>
        </div>
        <div className="flex gap-4">
          <span className="text-zinc-600 italic">PWA Desktop v1.0.4 - MIT Licensed</span>
          <span className="text-emerald-500 font-semibold">AUTO-OPTIMIZE: ON</span>
        </div>
      </footer>
    </div>
  );
}
