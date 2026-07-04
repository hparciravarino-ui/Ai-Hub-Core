import React, { useState, useEffect } from "react";
import CognitiveMap from "./CognitiveMap";
import { chatAPI } from "../apiClient";
import {
  Brain,
  Database,
  GitMerge,
  Terminal,
  Activity,
  User,
  Settings,
  Code2,
  FileCode,
  ShieldCheck,
  Zap,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Cpu,
  Bookmark,
  Share2,
  Plus,
  Trash2,
  Search,
  BookOpen,
  Boxes,
  HelpCircle,
  Eye,
  Workflow,
  ChevronRight,
  TrendingUp,
  Download,
  Upload
} from "lucide-react";

// Types for AEE
interface MemoryEntry {
  id: string;
  category: "preference" | "style" | "glossary" | "decision";
  title: string;
  content: string;
  timestamp: string;
}

interface KnowledgeNode {
  id: string;
  label: string;
  type: "user" | "project" | "file" | "api" | "database" | "library";
  x: number;
  y: number;
}

interface KnowledgeLink {
  source: string;
  target: string;
  relation: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarColor: string;
  specialty: string;
}

interface Adapter {
  id: string;
  name: string;
  baseModel: string;
  version: string;
  size: string;
  active: boolean;
  accuracyMultiplier: number;
  description: string;
}

const INITIAL_MEMORIES: MemoryEntry[] = [
  { id: "mem_1", category: "preference", title: "Preferenza Framework", content: "Utilizzo primario di React 18 con Vite e Tailwind CSS, preferendo approccio modulare e TypeScript.", timestamp: "29/06/2026 14:12" },
  { id: "mem_2", category: "style", title: "Stile di Scrittura Codice", content: "Arrow functions, hooks personalizzati per la logica di stato, e forte tipizzazione rigorosa senza uso di 'any'.", timestamp: "30/06/2026 09:44" },
  { id: "mem_3", category: "glossary", title: "Glossario Tecnico Interno", content: "AEE: AI Evolution Engine. Core SDK: il modulo di interoperabilità gRPC per comunicare con il kernel Go.", timestamp: "01/07/2026 08:30" },
  { id: "mem_4", category: "decision", title: "Decisione Architetturale", content: "Scelta di SQLite crittografato localmente in SQLCipher per la persistenza cache di grandi dimensioni su hardware 8GB.", timestamp: "01/07/2026 09:05" },
];

const INITIAL_NODES: KnowledgeNode[] = [
  { id: "node_user", label: " hp.arci.ravarino (Utente)", type: "user", x: 250, y: 150 },
  { id: "node_proj", label: "AI Hub Community (Progetto)", type: "project", x: 250, y: 280 },
  { id: "node_app", label: "App.tsx (Entrypoint)", type: "file", x: 120, y: 380 },
  { id: "node_srv", label: "server.ts (Backend API)", type: "file", x: 380, y: 380 },
  { id: "node_gemini", label: "Gemini 3.5 Flash", type: "library", x: 450, y: 260 },
  { id: "node_db", label: "SQLite Local SQLCipher", type: "database", x: 380, y: 480 },
];

const INITIAL_LINKS: KnowledgeLink[] = [
  { source: "node_user", target: "node_proj", relation: "Sviluppa e Gestisce" },
  { source: "node_proj", target: "node_app", relation: "Contiene UI" },
  { source: "node_proj", target: "node_srv", relation: "Avvia Servizio" },
  { source: "node_srv", target: "node_db", relation: "Persiste Cache" },
  { source: "node_proj", target: "node_gemini", relation: "Utilizza per Inferenza" },
];

const AGENTS_LIST: Agent[] = [
  { id: "agt_arch", name: "Architect Agent", role: "Architettura", description: "Modella e supervisiona la struttura complessiva dei moduli software e flussi di dati.", avatarColor: "from-sky-500 to-blue-600", specialty: "Design Patterns, UML" },
  { id: "agt_back", name: "Backend Agent", role: "Server & API", description: "Genera ed ottimizza endpoint veloci in Express, Node, Python o Go.", avatarColor: "from-emerald-500 to-teal-600", specialty: "API REST, gRPC, Auth" },
  { id: "agt_front", name: "Frontend Agent", role: "Interfaccia Utente", description: "Crea UI responsive e accessibili con Tailwind CSS, React e librerie grafiche.", avatarColor: "from-violet-500 to-indigo-600", specialty: "React, Motion, Tailwind" },
  { id: "agt_db", name: "Database Agent", role: "Infrastruttura Dati", description: "Progetta schemi SQL/NoSQL, scrive query efficienti e previene deadlock.", avatarColor: "from-yellow-500 to-amber-600", specialty: "Firestore, Postgres, SQLite" },
  { id: "agt_devops", name: "DevOps Agent", role: "CI/CD & Cloud", description: "Automatizza i flussi di deployment, monitora container Docker ed orchestrazioni Kubernetes.", avatarColor: "from-orange-500 to-red-600", specialty: "Docker, GitHub Actions, GCP" },
  { id: "agt_sec", name: "Security Agent", role: "Sicurezza (OWASP)", description: "Identifica chiavi esposte, SQL Injection, XSS e analizza dipendenze vulnerabili.", avatarColor: "from-rose-500 to-red-600", specialty: "OWASP Top 10, Secrets Audit" },
  { id: "agt_perf", name: "Performance Agent", role: "Ottimizzazione", description: "Trova colli di bottiglia, rendering ridondanti e consiglia ottimizzazioni RAM/VRAM.", avatarColor: "from-cyan-500 to-sky-600", specialty: "Memory profiling, Caching" },
  { id: "agt_uxui", name: "UX/UI Agent", role: "Design d'Esperienza", description: "Ottimizza usabilità, accessibilità WCAG, flussi interattivi e layout per massimizzare la chiarezza.", avatarColor: "from-pink-500 to-purple-600", specialty: "Usabilità, Accessibilità, Micro-interazioni" },
  { id: "agt_test", name: "Testing Agent", role: "Quality Assurance", description: "Scrive unit-test, test d'integrazione ed e2e per minimizzare regressioni nel codice.", avatarColor: "from-green-500 to-emerald-600", specialty: "Jest, Playwright, Vitest" },
  { id: "agt_docs", name: "Documentation Agent", role: "Documentazione", description: "Genera e mantiene file README, schemi di architettura e manuali tecnici completi.", avatarColor: "from-fuchsia-500 to-pink-600", specialty: "Technical Writing, Markdown, JSDoc" },
  { id: "agt_research", name: "Research Agent", role: "Ricerca e Analisi", description: "Esegue ricerche di mercato, confronta paper scientifici ed analizza librerie open source.", avatarColor: "from-teal-500 to-cyan-600", specialty: "Web Scrape, Paper Review, Benchmarking" },
];

const INITIAL_ADAPTERS: Adapter[] = [
  { id: "ad_coding", name: "LoRA TypeScript & ESM Expert", baseModel: "Gemini 3.5 Flash", version: "v1.4", size: "48 MB", active: true, accuracyMultiplier: 1.15, description: "Migliora la generazione di codice TypeScript asincrono e la conformità con il sistema a moduli ESM." },
  { id: "ad_security", name: "LoRA OWASP Shield Engine", baseModel: "Gemini 3.5 Flash", version: "v2.1", size: "120 MB", active: false, accuracyMultiplier: 1.28, description: "Addestramento specialistico per rilevare ed evitare sanitizzazioni deboli, cookie vulnerabili o chiavi API hardcoded." },
];

export default function AIEvolutionEngine() {
  const [activeSubTab, setActiveSubTab] = useState<"cognitive" | "learning" | "agents" | "sandbox" | "adapters" | "ecosystem">("cognitive");
  
  // Cognitive Level states
  const [memories, setMemories] = useState<MemoryEntry[]>(INITIAL_MEMORIES);
  const [searchMemQuery, setSearchMemQuery] = useState("");
  const [newMemTitle, setNewMemTitle] = useState("");
  const [newMemContent, setNewMemContent] = useState("");
  const [newMemCat, setNewMemCat] = useState<MemoryEntry["category"]>("preference");
  
  // Knowledge graph states
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  // Experience Stats
  const [expMetrics] = useState({
    solutionsAccepted: 142,
    exceptionsAvoided: 84,
    frequentLang: "TypeScript (React)",
    namingStyle: "camelCase Rigoroso",
    activeContextFiles: 8,
    adaptationLevel: 94, // %
  });

  // Multi-Agent Simulation state
  const [agentPrompt, setAgentPrompt] = useState("");
  const [isSimulatingAgents, setIsSimulatingAgents] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState<{ agent: Agent; text: string; confidence: number }[]>([]);

  // Self Evaluation Sandbox states
  const [sandboxCode, setSandboxCode] = useState(`// Incolla qui un frammento di codice per testarlo nel Laboratorio Sicuro
function handleUserAuth(req, res) {
  const token = req.headers.authorization;
  if (token === "SUPER_SECRET_ADMIN_TOKEN") {
    // Rischio sicurezza: Hardcoded bypass
    return res.status(200).json({ role: "admin" });
  }
  
  // Richiede validazione asincrona del DB
  return validateToken(token).then(isValid => {
      if (isValid) return res.status(200).json({ role: "user" });
      return res.status(401).send("Non autorizzato");
  }).catch(e => res.status(500).send("Errore Server"));
}`);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    reliabilityScore: number;
    logicalCheck: string;
    securityAudit: string;
    performanceImpact: string;
    vulnerabilitiesDetected: string[];
  } | null>(null);

  // Adapters States
  const [adapters, setAdapters] = useState<Adapter[]>(INITIAL_ADAPTERS);
  const [newAdapterName, setNewAdapterName] = useState("");
  const [newAdapterWeight, setNewAdapterWeight] = useState(1.10);

  // SDK / Ecosystem Plugin list
  const [customPlugins, setCustomPlugins] = useState([
    { name: "Parser Rust Cargo.toml", type: "Parser", author: " hp.arci.ravarino", status: "Active" },
    { name: "Optimizer Vector Cache PostgreSQL", type: "Runtime Optimizer", author: "System", status: "Active" }
  ]);

  // Distributed Memory States
  const [distMemStates, setDistMemStates] = useState([
    { id: "chat", name: "Memoria della Singola Chat", scope: "Sessione corrente", size: "12.4 KB", active: true },
    { id: "project", name: "Memoria del Progetto", scope: "Workspace locale", size: "45.8 KB", active: true },
    { id: "org", name: "Memoria dell'Organizzazione", scope: "Team e repository condivisi", size: "112.1 KB", active: false },
    { id: "global", name: "Memoria Globale dell'Utente", scope: "Profilo centralizzato", size: "256.4 KB", active: true },
  ]);

  // Contextual Learning Environments
  const [activeContextEnv, setActiveContextEnv] = useState("web_react");
  const [isContextLoading, setIsContextLoading] = useState(false);
  
  // Competencies and Skills Map (React, Firebase, Docker, Rust, Python, DevOps, UX)
  const [userSkills, setUserSkills] = useState([
    { id: "react", name: "React Avanzato", level: 92, group: "Frontend" },
    { id: "firebase", name: "Firebase (Auth & Firestore)", level: 85, group: "Backend" },
    { id: "docker", name: "Docker & Containerization", level: 78, group: "DevOps" },
    { id: "rust", name: "Rust Systems Programming", level: 64, group: "Systems" },
    { id: "python", name: "Python AI & Data Science", level: 88, group: "AI/Data" },
    { id: "devops", name: "DevOps CI/CD", level: 80, group: "DevOps" },
    { id: "ux", name: "UX/UI Design Principles", level: 75, group: "Design" },
  ]);

  const toggleDistMemActive = (id: string) => {
    setDistMemStates(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const clearDistMem = (id: string) => {
    setDistMemStates(prev => prev.map(m => m.id === id ? { ...m, size: "0.0 KB (Svuotata)" } : m));
  };

  const updateSkillLevel = (id: string, newLevel: number) => {
    setUserSkills(prev => prev.map(s => s.id === id ? { ...s, level: newLevel } : s));
  };

  const handleContextChange = (env: string) => {
    setIsContextLoading(true);
    setTimeout(() => {
      setActiveContextEnv(env);
      setIsContextLoading(false);
    }, 800);
  };

  // Memory Addition Handler
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTitle.trim() || !newMemContent.trim()) return;
    
    const newEntry: MemoryEntry = {
      id: "mem_" + Date.now(),
      category: newMemCat,
      title: newMemTitle,
      content: newMemContent,
      timestamp: new Date().toLocaleString("it-IT")
    };

    setMemories([newEntry, ...memories]);
    setNewMemTitle("");
    setNewMemContent("");
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
  };

  // Memory Export JSON
  const handleExportMemories = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "AEE_Memory_Backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Simulated Agent Debates
  const handleStartAgentSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentPrompt.trim()) return;

    setIsSimulatingAgents(true);
    setSimLogs([]);
    setSimStep(1);

    try {
      const response = await chatAPI(
        `Esegui una simulazione di uno Swarm di AI su questa richiesta: "${agentPrompt}". Restituisci ESATTAMENTE un array JSON (e nient'altro) di 4 oggetti, dove ogni oggetto ha le seguenti chiavi: "agentId" (da 0 a 3 per Architect, Database, Frontend, Security), "text" (la risposta dell'agente), "confidence" (numero da 0 a 100). Esempio: [{"agentId": 0, "text": "...", "confidence": 95}, ...]`,
        [],
        "Sei un sistema di orchestrazione Multi-Agente."
      );

      const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedLogs = JSON.parse(cleanedResponse);

      if (Array.isArray(parsedLogs)) {
        for (let i = 0; i < parsedLogs.length; i++) {
          const logData = parsedLogs[i];
          const agentIndex = Math.min(Math.max(logData.agentId || i, 0), AGENTS_LIST.length - 1);
          const newLog = {
            agent: AGENTS_LIST[agentIndex],
            text: logData.text || "Analisi completata.",
            confidence: logData.confidence || 90
          };
          
          await new Promise(resolve => setTimeout(resolve, 800)); // Simuliamo il delay di streaming visivo
          setSimLogs(prev => [...prev, newLog]);
          setSimStep(i + 2);
        }
      }
    } catch (err) {
      setSimLogs(prev => [...prev, {
        agent: AGENTS_LIST[0],
        text: `Errore durante la simulazione: ${err instanceof Error ? err.message : String(err)}`,
        confidence: 0
      }]);
    } finally {
      setIsSimulatingAgents(false);
      setSimStep(5);
    }
  };

  // Safe Laboratory evaluation
  const handleEvaluateCode = async () => {
    if (!sandboxCode.trim()) return;
    setIsEvaluating(true);
    setEvalResult(null);

    try {
      const response = await chatAPI(
        `Analizza il seguente codice e restituisci ESATTAMENTE un oggetto JSON valido (e nient'altro) con le seguenti chiavi: "reliabilityScore" (numero 0-100), "logicalCheck" (stringa), "securityAudit" (stringa), "performanceImpact" (stringa), "vulnerabilitiesDetected" (array di stringhe).
        
        Codice:
        ${sandboxCode}`,
        [],
        "Sei un Code Reviewer e Auditor di Sicurezza."
      );

      const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResult = JSON.parse(cleanedResponse);

      setEvalResult({
        reliabilityScore: parsedResult.reliabilityScore || 0,
        logicalCheck: parsedResult.logicalCheck || "Verifica completata.",
        securityAudit: parsedResult.securityAudit || "Audit completato.",
        performanceImpact: parsedResult.performanceImpact || "N/A",
        vulnerabilitiesDetected: parsedResult.vulnerabilitiesDetected || []
      });
    } catch (err) {
      setEvalResult({
        reliabilityScore: 0,
        logicalCheck: "Errore durante l'analisi logica.",
        securityAudit: `Impossibile completare l'audit: ${err instanceof Error ? err.message : String(err)}`,
        performanceImpact: "N/A",
        vulnerabilitiesDetected: ["Errore del sistema di valutazione API"]
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Adapters toggler
  const handleToggleAdapter = (id: string) => {
    setAdapters(adapters.map(ad => ad.id === id ? { ...ad, active: !ad.active } : ad));
  };

  const handleCreateAdapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdapterName.trim()) return;

    const newAd: Adapter = {
      id: "ad_" + Date.now(),
      name: newAdapterName,
      baseModel: "Gemini 3.5 Flash",
      version: "v1.0",
      size: "24 MB",
      active: true,
      accuracyMultiplier: newAdapterWeight,
      description: "Adattatore LoRA custom addestrato localmente."
    };

    setAdapters([...adapters, newAd]);
    setNewAdapterName("");
  };

  const filteredMemories = memories.filter(m =>
    m.title.toLowerCase().includes(searchMemQuery.toLowerCase()) ||
    m.content.toLowerCase().includes(searchMemQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="ai-evolution-engine-main">
      
      {/* HEADER DECORATIVE BANNER */}
      <div className="relative overflow-hidden bg-zinc-950 border border-zinc-850 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6" id="aee-hero-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-950/80 border border-emerald-900 rounded-lg">
              <Brain className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Modulo Cognitivo Avanzato</span>
              <h2 className="text-base font-bold text-zinc-100 tracking-tight">AI Evolution Engine (AEE)</h2>
            </div>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Ecosistema di intelligenza adattiva basato su memoria persistente strutturata, grafi di conoscenza locale, cooperazione multi-agente e verifica asincrona di affidabilità.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60 relative z-10 shrink-0 font-mono text-[11px]">
          <div>
            <div className="text-zinc-500">Adattamento Locale</div>
            <div className="text-sm font-bold text-emerald-400">{expMetrics.adaptationLevel}%</div>
          </div>
          <div className="h-6 w-px bg-zinc-800"></div>
          <div>
            <div className="text-zinc-500">Memorie Salvate</div>
            <div className="text-sm font-bold text-zinc-200">{memories.length} record</div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION BAR */}
      <div className="flex flex-wrap gap-1 bg-barbg p-1 rounded-xl border border-zinc-850" id="aee-navigation-tabs">
        <button
          onClick={() => setActiveSubTab("cognitive")}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "cognitive" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Livelli Cognitivi & Memoria</span>
        </button>

        <button
          onClick={() => setActiveSubTab("learning")}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "learning" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Meta Learning & Abitudini</span>
        </button>

        <button
          onClick={() => setActiveSubTab("agents")}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "agents" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Squadra Multi-Agenti</span>
        </button>

        <button
          onClick={() => setActiveSubTab("sandbox")}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "sandbox" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Laboratorio Autovalutazione</span>
        </button>

        <button
          onClick={() => setActiveSubTab("adapters")}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "adapters" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Adattatori (LoRA)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ecosystem")}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "ecosystem" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>Ecosistema SDK</span>
        </button>
      </div>

      {/* MAIN VIEWPORT PANELS */}
      <div id="aee-subpanel-content">
        
        {/* SUB TAB 1: COGNITIVE LEVELS & MEMORY */}
        {activeSubTab === "cognitive" && (
          <div className="space-y-6">
            
            {/* D3.js Force-Directed Cognitive Map */}
            <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Mappa Cognitiva Globale & Preferenze (D3.js Force Simulation)</span>
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Grafo semantico dinamico basato su forze fisiche che rappresenta i collegamenti in tempo reale tra progetti, file, e le regole di memoria persistite. Puoi trascinare i nodi, modificarne i parametri di carica/collisione, e aggiungere nuove connessioni personalizzate.
                </p>
              </div>

              <CognitiveMap memories={memories} />
            </div>

            {/* Sub-grid: Memory editing & logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left side: Memory management */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Memoria Permanente a Lungo Termine</h3>
                      <p className="text-[11px] text-zinc-500 mt-1">Preferenze, convenzioni di codice, e glossari esportabili ed editabili.</p>
                    </div>

                    <button
                      onClick={handleExportMemories}
                      className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-[10px] font-mono px-2.5 py-1 rounded text-zinc-300 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Esporta JSON</span>
                    </button>
                  </div>

                  {/* Add new memory prompt */}
                  <form onSubmit={handleAddMemory} className="bg-barbg p-4 border border-zinc-850 rounded-lg space-y-3">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Insegna nuove nozioni o regole all'AI</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono block mb-1">Titolo nozione</span>
                        <input
                          type="text"
                          placeholder="Es: Prefisso file CSS"
                          value={newMemTitle}
                          onChange={(e) => setNewMemTitle(e.target.value)}
                          className="w-full bg-appbg border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono block mb-1">Categoria</span>
                        <select
                          value={newMemCat}
                          onChange={(e) => setNewMemCat(e.target.value as any)}
                          className="w-full bg-appbg border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
                        >
                          <option value="preference">Preferenza operative</option>
                          <option value="style">Stile di Scrittura</option>
                          <option value="glossary">Glossario Termini</option>
                          <option value="decision">Decisione Progettuale</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 font-mono block mb-1">Contenuto della regola</span>
                      <textarea
                        rows={2}
                        placeholder="Scrivi qui cosa deve ricordare per le future sessioni o analisi di file..."
                        value={newMemContent}
                        onChange={(e) => setNewMemContent(e.target.value)}
                        className="w-full bg-appbg border border-zinc-800 rounded p-2 text-xs text-zinc-200 focus:outline-none placeholder-zinc-500 resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-800/60 py-1.5 rounded text-xs font-mono font-semibold transition"
                    >
                      Memorizza e persisti
                    </button>
                  </form>

                  {/* Filter and Search Memories list */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Cerca regole di memoria attiva..."
                        value={searchMemQuery}
                        onChange={(e) => setSearchMemQuery(e.target.value)}
                        className="w-full bg-barbg border border-zinc-850 rounded-lg py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                      {filteredMemories.map((mem) => (
                        <div key={mem.id} className="p-3 bg-[#111111] border border-zinc-850 rounded-lg space-y-1 relative group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border ${
                                mem.category === "preference" ? "bg-sky-950/40 text-sky-400 border-sky-900/60" :
                                mem.category === "style" ? "bg-violet-950/40 text-violet-400 border-violet-900/60" :
                                mem.category === "glossary" ? "bg-amber-950/40 text-amber-400 border-amber-900/60" :
                                "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
                              }`}>
                                {mem.category}
                              </span>
                              <span className="text-xs font-bold text-zinc-200">{mem.title}</span>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteMemory(mem.id)}
                              className="text-zinc-600 hover:text-red-400 transition cursor-pointer"
                              title="Elimina regola"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{mem.content}</p>
                          <span className="text-[8px] font-mono text-zinc-600 block pt-1">Salvato il: {mem.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Right side: Telemetry and distributed stats */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Level 4: Experience tracker stats */}
                <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Level 4 – Motore di Esperienza</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-barbg border border-zinc-850 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-500 block">Soluzioni Accettate</span>
                      <span className="text-sm font-bold text-emerald-400">{expMetrics.solutionsAccepted}</span>
                    </div>
                    <div className="p-2.5 bg-barbg border border-zinc-850 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-500 block">Errori Prevenuti</span>
                      <span className="text-sm font-bold text-indigo-400">{expMetrics.exceptionsAvoided}</span>
                    </div>
                  </div>
                </div>

                {/* Memoria Distribuita & Livelli di Isolamento */}
                <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Memoria Distribuita & Isolamento</h3>
                    <p className="text-[11px] text-zinc-500 mt-1">Gestisci la segregazione dei dati di addestramento e della conoscenza locale.</p>
                  </div>

                  <div className="space-y-3">
                    {distMemStates.map((level) => (
                      <div key={level.id} className="p-3 bg-barbg border border-zinc-850 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-zinc-200 block">{level.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{level.scope}</span>
                          </div>
                          <button
                            onClick={() => toggleDistMemActive(level.id)}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition ${
                              level.active
                                ? "bg-emerald-950/40 text-emerald-400 border-emerald-900"
                                : "bg-zinc-900 text-zinc-500 border-zinc-800"
                            }`}
                          >
                            {level.active ? "ATTIVO" : "DISATTIVO"}
                          </button>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-mono pt-1.5 border-t border-zinc-900">
                          <span className="text-zinc-500">Dimensione: <strong className="text-zinc-300">{level.size}</strong></span>
                          <button
                            onClick={() => clearDistMem(level.id)}
                            className="text-zinc-500 hover:text-red-400 text-[9px] transition cursor-pointer"
                          >
                            Svuota
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SUB TAB 2: META LEARNING & HABITS */}
        {activeSubTab === "learning" && (
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-6">
            
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Meta Learning Engine (Schemi Ricorrenti)</h3>
                <p className="text-[11px] text-zinc-500 mt-1">L'AI individua automaticamente preferenze e abitudini operative proponendole preventivamente.</p>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                ADAPTIVE MODE ATTIVO
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Schemi Identificati</span>
                
                <div className="space-y-3">
                  <div className="p-3 bg-barbg border border-zinc-850 rounded-lg flex items-start gap-3">
                    <FileCode className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-zinc-200 block">Linguaggio Dominante</span>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Predilezione per <strong className="text-zinc-300">TypeScript (React TSX)</strong> con modulo ES Module ed importazione named.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-barbg border border-zinc-850 rounded-lg flex items-start gap-3">
                    <Settings className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-zinc-200 block">Convenzioni Naming</span>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Prefissi camelCase con dichiarazione esplicita del tipo prima del blocco di return.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-barbg border border-zinc-850 rounded-lg flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-zinc-200 block">Prevenzione Bug</span>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Sanitizzazione perimetrale di stringhe e controllo formati prima di invocazioni esterne.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Predictor */}
              <div className="p-5 bg-[#0e0e0e] border border-zinc-850 rounded-xl space-y-4">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Motore Predittivo (Prossimi Suggerimenti)</span>
                
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Basandosi sui file modificati di recente e l'analisi del workspace attuale, l'AI prevede i seguenti task critici:
                </p>

                <div className="space-y-2.5 font-mono text-[11px]">
                  <div className="p-2.5 bg-barbg border border-zinc-800 rounded-lg flex items-center justify-between">
                    <span className="text-zinc-300">1. Generare test unitari per `auth.service.ts`</span>
                    <span className="text-[9px] text-amber-400 bg-amber-950/20 border border-amber-900 px-1.5 rounded">Consigliato</span>
                  </div>

                  <div className="p-2.5 bg-barbg border border-zinc-800 rounded-lg flex items-center justify-between">
                    <span className="text-zinc-300">2. Esportare lo schema cache in file SQL statico</span>
                    <span className="text-[9px] text-sky-400 bg-sky-950/20 border border-sky-900 px-1.5 rounded">Ottimizzazione</span>
                  </div>

                  <div className="p-2.5 bg-barbg border border-zinc-800 rounded-lg flex items-center justify-between">
                    <span className="text-zinc-300">3. Sanare la vulnerabilità 'axios' in package.json</span>
                    <span className="text-[9px] text-red-400 bg-red-950/20 border border-red-900 px-1.5 rounded">Sicurezza</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 2: Apprendimento Contestuale & Sistema di Competenze */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-850 pt-6">
              
              {/* Apprendimento Contestuale */}
              <div className="p-5 bg-barbg border border-zinc-850 rounded-xl space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-950/80 border border-emerald-900 rounded-lg">
                    <Workflow className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Apprendimento Contestuale</h4>
                    <p className="text-[11px] text-zinc-500">Ricostruzione automatica della conoscenza all'avvio del progetto.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono block mb-1.5">Seleziona Ambiente Progetto per simulare il ripristino di contesto</span>
                    <div className="flex gap-2">
                      <select
                        value={activeContextEnv}
                        onChange={(e) => handleContextChange(e.target.value)}
                        className="flex-1 bg-appbg border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
                      >
                        <option value="web_react">Sito Web Fullstack (Vite + React + Express)</option>
                        <option value="python_ai">Data Pipeline & Agents (Python + PyTorch)</option>
                        <option value="rust_cli">Rust Systems & CLI Parser (Cargo)</option>
                      </select>
                    </div>
                  </div>

                  {isContextLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-2 border border-dashed border-zinc-850 rounded-lg bg-zinc-950/40">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-mono text-zinc-500 animate-pulse">Ricostruzione schemi e API...</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-lg space-y-2.5 font-mono text-[11px]">
                      <div className="flex justify-between items-center pb-1 border-b border-zinc-900">
                        <span className="text-zinc-500">Stato di Caricamento:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ripristinato
                        </span>
                      </div>

                      {activeContextEnv === "web_react" && (
                        <div className="space-y-1.5 text-zinc-300">
                          <div><strong className="text-zinc-500">Architettura ricordata:</strong> Client-Side SPA con Express proxy. Port 3000.</div>
                          <div><strong className="text-zinc-500">Stile di Codice:</strong> TypeScript named, arrow functions, Tailwind CSS utilities.</div>
                          <div><strong className="text-zinc-500">API & DB attivi:</strong> SQLite local cache, Drizzle ORM, gRPC kernel.</div>
                          <div><strong className="text-zinc-500">Documentazione:</strong> AEE_Memory_Backup.json, package.json dependencies.</div>
                        </div>
                      )}

                      {activeContextEnv === "python_ai" && (
                        <div className="space-y-1.5 text-zinc-300">
                          <div><strong className="text-zinc-500">Architettura ricordata:</strong> FastAPI router asincrono + scheduler code.</div>
                          <div><strong className="text-zinc-500">Stile di Codice:</strong> Python PEP8, strict type hints, snake_case.</div>
                          <div><strong className="text-zinc-500">API & DB attivi:</strong> HuggingFace integrations, vector DB Chroma local cache.</div>
                          <div><strong className="text-zinc-500">Documentazione:</strong> requirements.txt, pyproject.toml schemas.</div>
                        </div>
                      )}

                      {activeContextEnv === "rust_cli" && (
                        <div className="space-y-1.5 text-zinc-300">
                          <div><strong className="text-zinc-500">Architettura ricordata:</strong> Rust multi-threaded cli app con Cargo integration.</div>
                          <div><strong className="text-zinc-500">Stile di Codice:</strong> Rust idiomatic ownership, safe concurrency, strict Result mapping.</div>
                          <div><strong className="text-zinc-500">API & DB attivi:</strong> Local memory structures, direct syscall bindings.</div>
                          <div><strong className="text-zinc-500">Documentazione:</strong> Cargo.toml parser details, lib.rs guidelines.</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sistema di Competenze */}
              <div className="p-5 bg-barbg border border-zinc-850 rounded-xl space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-950/80 border border-indigo-900 rounded-lg">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Mappa delle Competenze Utente</h4>
                    <p className="text-[11px] text-zinc-500">Tracciamento dinamico per la personalizzazione asincrona delle risposte AI.</p>
                  </div>
                </div>

                {/* Interactive Skills */}
                <div className="space-y-2.5">
                  {userSkills.map((skill) => (
                    <div key={skill.id} className="space-y-1 font-mono text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300 font-bold">{skill.name}</span>
                        <span className="text-indigo-400 font-bold">{skill.level}%</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.level}
                          onChange={(e) => updateSkillLevel(skill.id, parseInt(e.target.value))}
                          className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                        />
                        <span className="text-zinc-500 text-[8px] uppercase">{skill.group}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tone explanation indicator */}
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg font-mono text-[10px] space-y-1">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider">Tono di Spiegazione Attivo:</span>
                  <p className="text-zinc-300 leading-relaxed">
                    {(() => {
                      const avg = userSkills.reduce((sum, s) => sum + s.level, 0) / userSkills.length;
                      if (avg > 82) {
                        return "🎯 ULTRA-SINTETICO PER ESPERTI: L'AI eviterà descrizioni teoriche di base, fornendo direttamente soluzioni tipizzate e best practices di livello Enterprise.";
                      } else if (avg > 65) {
                        return "⚡ TECNICO / PRATICO: Spiegazioni focalizzate sulla logica architetturale, vantaggi prestazionali dei pattern, e suggerimenti per ottimizzare codice esistente.";
                      } else {
                        return "📚 DIDATTICO / ESPLICATIVO: Supporto didattico con dettagliate descrizioni concettuali di base, commenti esaustivi riga per riga, e link utili per l'apprendimento.";
                      }
                    })()}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SUB TAB 3: MULTI-AGENT COLLABORATION */}
        {activeSubTab === "agents" && (
          <div className="space-y-6">
            
            {/* Simulation controls */}
            <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">AI Multi-Agent Collaborative Workbench</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Interpella simultaneamente gli agenti di competenza per dibattere, correggere o progettare moduli software complessi.</p>
              </div>

              <form onSubmit={handleStartAgentSimulation} className="flex gap-2 bg-barbg p-3 border border-zinc-850 rounded-xl">
                <input
                  type="text"
                  placeholder="Inserisci un obiettivo (es: Ottimizzare le query SQL del database riducendo il lock del thread)"
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  className="flex-1 bg-appbg border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSimulatingAgents}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer shrink-0"
                >
                  {isSimulatingAgents ? "Discussione attiva..." : "Avvia Dibattito"}
                </button>
              </form>
            </div>

            {/* Simulated Live Terminal logs */}
            {simLogs.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-zinc-300">CONVERSAZIONE TRA AGENTI SPECIALIZZATI</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Step {simStep}/5
                  </span>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {simLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 bg-barbg/40 p-3 border border-zinc-900 rounded-xl">
                      <div className={`w-8 h-8 rounded-lg shrink-0 bg-gradient-to-br ${log.agent.avatarColor} flex items-center justify-center font-bold text-xs text-white`}>
                        {log.agent.name.substring(0, 2)}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-zinc-200">{log.agent.name}</span>
                            <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 rounded font-mono">{log.agent.role}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400">Affidabilità: {log.confidence}%</span>
                        </div>
                        <p className="text-xs text-zinc-300 font-sans leading-relaxed italic">
                          "{log.text}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {simStep === 5 && (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-900/60 rounded-xl text-xs space-y-2">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <strong className="text-emerald-300">Consenso Raggiunto: Architettura Facade validata</strong>
                    </div>
                    <p className="text-zinc-400">
                      I sei agenti concordano sul disaccoppiamento del modulo. Viene generata una bozza di astrazione TSX pronta all'uso.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* List of 6 specialized agents */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AGENTS_LIST.map((agt) => (
                <div key={agt.id} className="p-4 bg-panelbg border border-zinc-800 rounded-xl flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl shrink-0 bg-gradient-to-br ${agt.avatarColor} flex items-center justify-center font-bold text-xs text-white`}>
                    {agt.name.substring(0, 2)}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{agt.name}</span>
                      <span className="text-[9px] bg-zinc-850 text-zinc-400 px-1.5 rounded font-mono font-semibold">{agt.role}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{agt.description}</p>
                    <span className="text-[9px] font-mono text-emerald-400 block pt-0.5">Focus: {agt.specialty}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* SUB TAB 4: SELF-EVALUATION SANDBOX */}
        {activeSubTab === "sandbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input code script area */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Laboratorio Sicuro di Autovalutazione</h3>
                  <p className="text-[11px] text-zinc-500 mt-1">Esegui una simulazione di modifiche e calcola l'indice di stabilità.</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 font-mono block">Codice da scansionare offline</span>
                  <textarea
                    rows={12}
                    value={sandboxCode}
                    onChange={(e) => setSandboxCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 font-mono text-xs text-emerald-300 focus:outline-none placeholder-zinc-600 leading-relaxed"
                  ></textarea>
                </div>

                <button
                  onClick={handleEvaluateCode}
                  disabled={isEvaluating}
                  className="w-full bg-emerald-500 text-black py-2 rounded-lg text-xs font-bold font-mono transition cursor-pointer"
                >
                  {isEvaluating ? "Esecuzione Simulazione..." : "Invia ed Esegui Analisi Pre-Push"}
                </button>
              </div>
            </div>

            {/* Simulation output and audit results */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Riepilogo Stabilità (AI Auditor)</h3>
                  <p className="text-[11px] text-zinc-500 mt-1">Esito della compilazione virtuale e controlli di sicurezza</p>
                </div>

                {evalResult ? (
                  <div className="space-y-4 font-mono text-[11px]">
                    
                    {/* Score badge circle */}
                    <div className="flex items-center justify-between p-3 bg-barbg border border-zinc-850 rounded-lg">
                      <span>Indice Affidabilità:</span>
                      <span className={`text-sm font-bold ${evalResult.reliabilityScore < 50 ? "text-red-400" : "text-emerald-400"}`}>
                        {evalResult.reliabilityScore} / 100
                      </span>
                    </div>

                    <div className="space-y-2 text-zinc-300">
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <strong className="text-indigo-400 block mb-1">Check Logico:</strong>
                        <p className="text-[10px] leading-relaxed font-sans">{evalResult.logicalCheck}</p>
                      </div>

                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <strong className="text-amber-400 block mb-1">Audit Sicurezza:</strong>
                        <p className="text-[10px] leading-relaxed font-sans">{evalResult.securityAudit}</p>
                      </div>

                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <strong className="text-sky-400 block mb-1">Risparmio Risorse:</strong>
                        <p className="text-[10px] leading-relaxed font-sans">{evalResult.performanceImpact}</p>
                      </div>
                    </div>

                    {evalResult.vulnerabilitiesDetected.length > 0 && (
                      <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg">
                        <strong className="block mb-1">Rischi Rilevati:</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          {evalResult.vulnerabilitiesDetected.map((v, i) => (
                            <li key={i}>{v}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-lg">
                    {isEvaluating ? "Analisi asincrona in corso..." : "Incolla il codice a sinistra e clicca 'Invia' per iniziare l'audit."}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* SUB TAB 5: LORA ADAPTERS */}
        {activeSubTab === "adapters" && (
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-6">
            
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Evoluzione Controllata – Adattatori LoRA</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Applica pesi correttivi specifici per affinare l'accuratezza senza toccare il Foundation Model.</p>
              </div>
              
              <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded font-mono font-bold">
                VERSIONATI
              </span>
            </div>

            {/* Create LoRA Form */}
            <form onSubmit={handleCreateAdapter} className="bg-barbg p-4 border border-zinc-850 rounded-lg space-y-3">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block">Inizializza nuovo adattatore fine-tune</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Nome Adattatore</span>
                  <input
                    type="text"
                    placeholder="Es: LoRA Rust Microservice"
                    value={newAdapterName}
                    onChange={(e) => setNewAdapterName(e.target.value)}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Peso correttivo (Accuracy Multiplier)</span>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="1.50"
                    value={newAdapterWeight}
                    onChange={(e) => setNewAdapterWeight(parseFloat(e.target.value))}
                    className="w-full bg-appbg border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-800/60 py-1.5 rounded text-xs font-mono font-semibold transition"
                  >
                    Genera Adattatore
                  </button>
                </div>
              </div>
            </form>

            {/* List of active adapters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adapters.map((ad) => (
                <div key={ad.id} className="p-4 bg-[#111111] border border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 font-mono block">{ad.name}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">Modello base: {ad.baseModel} | Tag: {ad.version}</span>
                    </div>

                    <button
                      onClick={() => handleToggleAdapter(ad.id)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition ${
                        ad.active
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-900"
                          : "bg-zinc-900 text-zinc-500 border-zinc-800"
                      }`}
                    >
                      {ad.active ? "ATTIVO" : "INATTIVO"}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{ad.description}</p>

                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-900">
                    <span>File size: {ad.size}</span>
                    <span className="text-emerald-400 font-semibold">Moltiplicatore Precisione: x{ad.accuracyMultiplier}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* SUB TAB 6: OPEN ECOSYSTEM SDK */}
        {activeSubTab === "ecosystem" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Code documentation SDK */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">AEE Plugin SDK Documentation</h3>
                  <p className="text-[11px] text-zinc-500 mt-1">Estendi le funzionalità cognitive dell'AI scrivendo parser e intercettori personalizzati.</p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">TEMPLATE PLUGIN IN TYPESCRIPT</span>
                  
                  <pre className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-[10px] text-emerald-300 overflow-x-auto leading-relaxed">
{`import { AEEPlugin, ProjectContext } from "@aee/sdk";

export default class CustomDependencyParser implements AEEPlugin {
  name = "Custom Cargo Parser";
  type = "Parser";

  async analyze(context: ProjectContext) {
    const files = await context.getFilesByPattern("**/Cargo.toml");
    for (const file of files) {
      const deps = this.parseDeps(file.content);
      context.registerDependencies(deps);
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Active user extensions */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Plugin Attivi nel Workspace</h3>
                  <p className="text-[11px] text-zinc-500 mt-1">Estensioni caricate localmente nel kernel</p>
                </div>

                <div className="space-y-2.5">
                  {customPlugins.map((plug, idx) => (
                    <div key={idx} className="p-3 bg-barbg border border-zinc-850 rounded-lg flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-zinc-200 font-bold block">{plug.name}</span>
                        <span className="text-[9px] text-zinc-500">Creato da: {plug.author}</span>
                      </div>
                      <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900 px-1.5 py-0.2 rounded font-mono font-semibold text-[9px]">
                        {plug.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
