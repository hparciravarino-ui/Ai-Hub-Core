import React, { useState, useEffect, useRef } from "react";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  FileText,
  FileCode,
  Search,
  Cpu,
  ShieldAlert,
  Zap,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  GitBranch,
  Play,
  Pause,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Code2,
  Plus,
  FileSymlink,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Flame,
  FileSignature,
  FileCheck2,
  Sliders,
  Maximize2,
  TrendingUp
} from "lucide-react";

// Types
interface ScannedFile {
  path: string;
  name: string;
  language: string;
  size: string;
  lines: number;
  complexity: "Bassa" | "Media" | "Elevata";
  lastModified: string;
}

interface Vulnerability {
  id: string;
  file: string;
  line: number;
  type: "OWASP" | "Secret" | "Insecure Config" | "Dependency";
  severity: "High" | "Medium" | "Low";
  description: string;
  remediation: string;
}

interface PerformanceIssue {
  id: string;
  file: string;
  line: number;
  type: "Memory Leak" | "Blocking I/O" | "Inefficient Loop" | "Redundant Rendering";
  impact: "Elevato" | "Medio" | "Basso";
  description: string;
  suggestion: string;
}

interface ArchitectureNode {
  id: string;
  name: string;
  type: "Component" | "Service" | "Controller" | "Database" | "API";
  dependencies: string[];
}

const SUPPORTED_LANGUAGES = [
  "TypeScript", "React (TSX)", "JavaScript", "Python", "Go", "Rust", "C++", "C#", "HTML/CSS", "SQL", "YAML/Docker"
];

// Presets for target projects
const DEMO_PROJECTS = [
  {
    id: "proj_ecommerce",
    name: "E-Commerce Microservices",
    path: "/home/user/workspace/ecommerce-platform",
    fileCount: 48520,
    size: "420 MB",
    languages: ["TypeScript", "Go", "YAML/Docker", "SQL"],
    frameworks: ["React", "Express", "Kubernetes", "PostgreSQL"]
  },
  {
    id: "proj_ml_pipeline",
    name: "ML Data Pipeline",
    path: "/home/user/workspace/ml-analytics-pipeline",
    fileCount: 12400,
    size: "1.2 GB",
    languages: ["Python", "C++", "YAML/Docker", "SQL"],
    frameworks: ["FastAPI", "PyTorch", "Docker", "SQLite"]
  },
  {
    id: "proj_legacy_net",
    name: "Legacy Enterprise App",
    path: "/home/user/workspace/enterprise-crm-dotnet",
    fileCount: 110250,
    size: "2.8 GB",
    languages: ["C#", "JavaScript", "SQL", "HTML/CSS"],
    frameworks: [".NET Core", "React", "MSSQL", "IIS"]
  }
];

export default function ProjectAnalyzer() {
  // Navigation & scanning control
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "explorer" | "architecture" | "performance" | "security" | "semantic">("dashboard");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("proj_ecommerce");
  
  // Scanning engine states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const [indexingProgress, setIndexingProgress] = useState<number>(100);
  const [paused, setPaused] = useState<boolean>(false);
  
  // Telemetry simulation
  const [metrics, setMetrics] = useState({
    cpuLoad: 12,
    gpuLoad: 0,
    ramUsed: 4.2,
    scannedFiles: 48520,
    indexedChunks: 198420,
    cacheSize: "148 MB",
    scanSpeed: 1450, // files/sec
  });

  // Semantic search input
  const [semanticQuery, setSemanticQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<{ file: string; context: string; relevance: number; line: number }[]>([]);

  // Refactoring patch simulated states
  const [selectedRefactorFile, setSelectedRefactorFile] = useState<string>("src/services/auth.service.ts");
  const [refactorOriginalName, setRefactorOriginalName] = useState<string>("validateUserSession");
  const [refactorNewName, setRefactorNewName] = useState<string>("verifySessionPayload");
  const [isApplyingRefactor, setIsApplyingRefactor] = useState<boolean>(false);
  const [refactorSuccess, setRefactorSuccess] = useState<boolean>(false);

  // Custom added path input
  const [customPathInput, setCustomPathInput] = useState<string>("");
  const [customPathAdded, setCustomPathAdded] = useState<boolean>(false);

  // Simulate progress bar and telemetry during scanning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((isScanning || isIndexing) && !paused) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setIsScanning(false);
            return 100;
          }
          return prev + 4;
        });

        setIndexingProgress(prev => {
          if (prev >= 100) {
            setIsIndexing(false);
            return 100;
          }
          return prev + 2;
        });

        setMetrics(prev => ({
          ...prev,
          cpuLoad: Math.round(45 + Math.random() * 30),
          gpuLoad: Math.round(10 + Math.random() * 15),
          ramUsed: parseFloat((5.1 + Math.random() * 0.4).toFixed(1)),
          scannedFiles: Math.min(48520, Math.round(prev.scannedFiles + (Math.random() * 1200))),
          indexedChunks: Math.min(198420, Math.round(prev.indexedChunks + (Math.random() * 4500))),
        }));
      }, 150);
    } else {
      // Idle state telemetry
      interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          cpuLoad: Math.round(8 + Math.random() * 6),
          gpuLoad: 0,
          ramUsed: parseFloat((3.8 + Math.random() * 0.2).toFixed(1)),
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isScanning, isIndexing, paused]);

  const handleStartFullScan = () => {
    setIsScanning(true);
    setIsIndexing(true);
    setScanProgress(12);
    setIndexingProgress(4);
    setPaused(false);
  };

  const handleTogglePause = () => {
    setPaused(!paused);
  };

  // Semantic query search simulator
  const handleSemanticSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);

    setTimeout(() => {
      const q = semanticQuery.toLowerCase();
      const results = [
        {
          file: "src/api/auth/v1/session.go",
          context: "func HandleSessionAuth(w http.ResponseWriter, r *http.Request) {\n\t// Utilizza il token JWT per autenticare la sessione locale\n\ttoken := r.Header.Get(\"Authorization\")",
          relevance: 98,
          line: 42
        },
        {
          file: "src/services/auth.service.ts",
          context: "export async function validateUserSession(jwtToken: string): Promise<boolean> {\n  // Fornisce il lock del contesto di sicurezza sandbox",
          relevance: 92,
          line: 114
        },
        {
          file: "src/db/queries.sql",
          context: "SELECT * FROM user_sessions WHERE expires_at > NOW() AND token_hash = $1;",
          relevance: 85,
          line: 19
        }
      ].filter(r => r.file.toLowerCase().includes(q) || r.context.toLowerCase().includes(q) || q.length > 2);

      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  // Refactoring patch simulation
  const handleApplyRefactor = () => {
    if (!refactorOriginalName || !refactorNewName) return;
    setIsApplyingRefactor(true);
    setRefactorSuccess(false);

    setTimeout(() => {
      setIsApplyingRefactor(false);
      setRefactorSuccess(true);
    }, 1500);
  };

  // Static mock file structure
  const mockFilesList: ScannedFile[] = [
    { path: "src/api/auth/v1/session.go", name: "session.go", language: "Go", size: "12 KB", lines: 340, complexity: "Media", lastModified: "01/07/2026 10:14" },
    { path: "src/services/auth.service.ts", name: "auth.service.ts", language: "TypeScript", size: "48 KB", lines: 1250, complexity: "Elevata", lastModified: "29/06/2026 15:32" },
    { path: "src/components/Navbar.tsx", name: "Navbar.tsx", language: "React (TSX)", size: "18 KB", lines: 450, complexity: "Bassa", lastModified: "30/06/2026 18:22" },
    { path: "src/db/queries.sql", name: "queries.sql", language: "SQL", size: "8 KB", lines: 190, complexity: "Bassa", lastModified: "12/05/2026 09:12" },
    { path: "kubernetes/deployment.yaml", name: "deployment.yaml", language: "YAML/Docker", size: "14 KB", lines: 280, complexity: "Media", lastModified: "25/06/2026 11:44" },
  ];

  // Static mock vulnerabilities list
  const mockVulnerabilities: Vulnerability[] = [
    {
      id: "vuln_1",
      file: "src/services/auth.service.ts",
      line: 142,
      type: "Secret",
      severity: "High",
      description: "Trovata chiave API Firebase (FIREBASE_API_KEY) definita direttamente nel codice sorgente.",
      remediation: "Sposta il segreto nel file .env.example e caricalo in memoria tramite process.env."
    },
    {
      id: "vuln_2",
      file: "src/api/auth/v1/session.go",
      line: 88,
      type: "OWASP",
      severity: "Medium",
      description: "Generazione di token di sessione debole tramite rand.Int() non crittografico.",
      remediation: "Utilizza crypto/rand per garantire la robustezza dei token generati."
    },
    {
      id: "vuln_3",
      file: "package.json",
      line: 24,
      type: "Dependency",
      severity: "Low",
      description: "La libreria 'axios' versione 0.21.1 ha vulnerabilità note (CVE-2021-3749).",
      remediation: "Aggiorna ad axios v1.6.0+ o superiore per mitigare i rischi SSRF."
    }
  ];

  // Static performance issues list
  const mockPerformanceIssues: PerformanceIssue[] = [
    {
      id: "perf_1",
      file: "src/services/auth.service.ts",
      line: 712,
      type: "Memory Leak",
      impact: "Elevato",
      description: "Ciclo infinito simulato su un thread di caching che non chiude i canali di connessione a PostgreSQL.",
      suggestion: "Inserisci un defer o un blocco catch per forzare la chiusura delle connessioni TCP."
    },
    {
      id: "perf_2",
      file: "src/components/Navbar.tsx",
      line: 45,
      type: "Redundant Rendering",
      impact: "Medio",
      description: "Ridisegno continuo della barra di navigazione principale in base alla telemetria globale non de-bouncata.",
      suggestion: "Utilizza React.memo o useCallback per limitare i rendering solo in caso di cambio effettivo dell'utente."
    }
  ];

  // Current active preset metadata
  const activePreset = DEMO_PROJECTS.find(p => p.id === selectedPresetId) || DEMO_PROJECTS[0];

  return (
    <div className="space-y-6" id="project-analyzer-tab">
      
      {/* 1. SELECTION & CONTROL SUBMENU BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-barbg p-4 border border-zinc-800 rounded-xl" id="analyzer-presets-bar">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Analizzatore Progetto Locale
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500">
            Scansione progressiva ad alte prestazioni per mappare architettura, vulnerabilità e colli di bottiglia offline.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-mono">Workspace:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => {
                setSelectedPresetId(e.target.value);
                setScanProgress(100);
                setIndexingProgress(100);
              }}
              className="bg-appbg border border-zinc-800 text-xs text-zinc-300 rounded px-2.5 py-1.5 focus:outline-none"
            >
              {DEMO_PROJECTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartFullScan}
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>Riavvia Scansione</span>
          </button>
        </div>
      </div>

      {/* 2. PROGRESS BAR & HARDWARE STATS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" id="analyzer-top-telemetry">
        
        {/* Scanned & Indexed Status Cards */}
        <div className="lg:col-span-2 bg-panelbg border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                STATO INDICIZZAZIONE VETTORIALE (RAG)
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300">
                {isScanning ? "SCANSIONE IN CORSO..." : "COMPLETATO"}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>Indicizzazione incrementale...</span>
                <span>{indexingProgress}%</span>
              </div>
              <div className="w-full bg-barbg h-1.5 rounded-full overflow-hidden border border-zinc-800/60">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${indexingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Scan controller pause button */}
            {isScanning && (
              <div className="flex gap-2">
                <button
                  onClick={handleTogglePause}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1"
                >
                  {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  {paused ? "Riprendi" : "Sospendi"}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-2 border-t border-zinc-850 pt-2 font-mono">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Fattore RAM: Memory Mapping & Lazy Loading attivo (ottimizzato 8GB).</span>
          </div>
        </div>

        {/* Active Telemetry CPU/GPU/RAM */}
        <div className="bg-panelbg border border-zinc-800 rounded-xl p-4 space-y-3">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Consumo Risorse Locale</span>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1 text-zinc-400">
                <span>CPU Threadpool:</span>
                <span className="text-zinc-200">{metrics.cpuLoad}%</span>
              </div>
              <div className="w-full bg-barbg h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${metrics.cpuLoad}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1 text-zinc-400">
                <span>VRAM GPU:</span>
                <span className="text-zinc-200">{metrics.gpuLoad}%</span>
              </div>
              <div className="w-full bg-barbg h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-violet-400" style={{ width: `${metrics.gpuLoad}%` }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-zinc-500">RAM Utilizzata:</span>
            <span className="text-zinc-300 font-semibold">{metrics.ramUsed} GB / 16.0 GB</span>
          </div>
        </div>

        {/* Quick totals card */}
        <div className="bg-panelbg border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Dimensione Database</span>
            <div className="text-xl font-bold font-mono text-zinc-200 mt-1">
              {metrics.scannedFiles.toLocaleString()} <span className="text-xs text-zinc-500">File</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-2 border-t border-zinc-850 pt-2">
            <span>Cache: {metrics.cacheSize}</span>
            <span>Speed: {metrics.scanSpeed} f/s</span>
          </div>
        </div>

      </div>

      {/* 3. SUB TAB NAVIGATION BAR */}
      <div className="flex border-b border-zinc-800 space-x-2 bg-barbg p-2 rounded-xl" id="analyzer-submenu-tabs">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "dashboard" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Dashboard & Linguaggi
        </button>
        <button
          onClick={() => setActiveSubTab("explorer")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "explorer" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Esplorazione File
        </button>
        <button
          onClick={() => setActiveSubTab("architecture")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "architecture" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Architettura & Moduli
        </button>
        <button
          onClick={() => setActiveSubTab("security")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "security" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Sicurezza (OWASP)
        </button>
        <button
          onClick={() => setActiveSubTab("performance")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "performance" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Colli di Bottiglia
        </button>
        <button
          onClick={() => setActiveSubTab("semantic")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "semantic" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Ricerca Semantica locale
        </button>
      </div>

      {/* 4. MAIN CONTENT SUB PANEL */}
      <div id="analyzer-subpanel-content">
        
        {/* SUB TAB A: DASHBOARD & METRICS */}
        {activeSubTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Project Specs */}
            <div className="lg:col-span-1 p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-4">
              <div>
                <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">Workspace Specifiche</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Caratteristiche fisiche della directory indicizzata</p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span className="text-zinc-500">Percorso locale:</span>
                  <span className="text-zinc-200 truncate max-w-[200px]" title={activePreset.path}>{activePreset.path}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span className="text-zinc-500">File Totali rilevati:</span>
                  <span className="text-emerald-400 font-bold">{(activePreset.fileCount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span className="text-zinc-500">Dimensione su disco:</span>
                  <span className="text-zinc-200">{activePreset.size}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span className="text-zinc-500">Moduli architetturali:</span>
                  <span className="text-zinc-200">14 moduli</span>
                </div>
              </div>

              {/* Languages breakdown (beautiful bento elements) */}
              <div className="space-y-3 pt-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Mappa linguaggi (%)</span>
                <div className="space-y-2">
                  {activePreset.languages.map((l, i) => {
                    const percentage = i === 0 ? 55 : i === 1 ? 25 : i === 2 ? 15 : 5;
                    return (
                      <div key={l} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-zinc-300">{l}</span>
                          <span className="text-zinc-400">{percentage}%</span>
                        </div>
                        <div className="w-full bg-barbg h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              i === 0 ? "bg-emerald-400" : i === 1 ? "bg-sky-400" : i === 2 ? "bg-yellow-400" : "bg-violet-400"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Architecture Overview */}
            <div className="lg:col-span-2 p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Identikit dell'Applicazione (AI Insight)</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Analisi semantica di alto livello integrata con l'AI Hub Core</p>
                </div>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                  PERSISTENTE
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-zinc-300 font-sans">
                <p>
                  Sulla base dei file di configurazione rilevati (<strong className="text-zinc-100">docker-compose.yaml, package.json, go.mod</strong>), questo workspace implementa un'architettura distribuzionale a microservizi orientata ad eventi.
                </p>
                
                <div className="bg-barbg p-3 border border-zinc-800 rounded-lg space-y-2">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Riepilogo moduli rilevati:</div>
                  <ul className="list-disc pl-4 space-y-1.5 text-zinc-400 font-mono text-[11px]">
                    <li><strong className="text-zinc-300">Modulo Autenticazione (Go)</strong>: Gestione token JWT e sessioni.</li>
                    <li><strong className="text-zinc-300">Client Web (React TSX)</strong>: Dashboard per utenti e grafici Recharts.</li>
                    <li><strong className="text-zinc-300">Orchestratore (Kubernetes)</strong>: File manifest yaml per scaling automatico.</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-2.5 bg-[#141414] border border-zinc-800 rounded-lg text-center">
                    <span className="text-[9px] font-mono text-zinc-500 block">COMPLESSITÀ DI CICLOMATICA</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">Media (14)</span>
                  </div>
                  <div className="p-2.5 bg-[#141414] border border-zinc-800 rounded-lg text-center">
                    <span className="text-[9px] font-mono text-zinc-500 block">COVERAGE DOCUMENTALE</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">68%</span>
                  </div>
                  <div className="p-2.5 bg-[#141414] border border-zinc-800 rounded-lg text-center">
                    <span className="text-[9px] font-mono text-zinc-500 block">DIPENDENZE OBSOLETE</span>
                    <span className="text-sm font-bold text-red-400 font-mono">4 critiche</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SUB TAB B: FILE EXPLORER */}
        {activeSubTab === "explorer" && (
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Catalogo e Analisi Complessità Singolo File</h4>
                <p className="text-[11px] text-zinc-500">Lazy Loading attivo sul thread locale</p>
              </div>
            </div>

            {/* Custom Path adding input to satisfy user selecting single file or folder */}
            <div className="flex gap-2 bg-barbg p-3 border border-zinc-800 rounded-xl">
              <div className="flex-1 relative">
                <Folder className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Digita percorso file o cartella locale (es: src/controllers/user.controller.ts)"
                  value={customPathInput}
                  onChange={(e) => setCustomPathInput(e.target.value)}
                  className="w-full bg-appbg border border-zinc-800 rounded-lg py-1.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (customPathInput.trim()) {
                    setCustomPathAdded(true);
                    setTimeout(() => setCustomPathAdded(false), 3000);
                  }
                }}
                className="bg-emerald-500/20 text-emerald-300 border border-emerald-800 px-4 py-1 rounded text-xs font-mono"
              >
                Inietta Analisi
              </button>
            </div>

            {customPathAdded && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-xs font-mono rounded-lg flex gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Analisi in background avviata. File iniettato nell'indice incrementale con successo!</span>
              </div>
            )}

            {/* Interactive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 pb-2">
                    <th className="py-2.5 font-bold">PERCORSO FILE</th>
                    <th className="py-2.5 font-bold">LINGUAGGIO</th>
                    <th className="py-2.5 font-bold">DIMENSIONE</th>
                    <th className="py-2.5 font-bold">RIGHE</th>
                    <th className="py-2.5 font-bold">COMPLESSITÀ</th>
                    <th className="py-2.5 font-bold">ULTIMA MODIFICA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  {mockFilesList.map((file) => (
                    <tr key={file.path} className="hover:bg-barbg/40 transition">
                      <td className="py-2.5 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-semibold text-zinc-200">{file.path}</span>
                      </td>
                      <td className="py-2.5">{file.language}</td>
                      <td className="py-2.5">{file.size}</td>
                      <td className="py-2.5">{file.lines}</td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] border ${
                          file.complexity === "Elevata"
                            ? "bg-red-950/30 text-red-400 border-red-900/60"
                            : file.complexity === "Media"
                            ? "bg-yellow-950/30 text-yellow-400 border-yellow-900/60"
                            : "bg-emerald-950/30 text-emerald-400 border-emerald-900/60"
                        }`}>
                          {file.complexity}
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-500">{file.lastModified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB TAB C: ARCHITECTURE & REFACTORING */}
        {activeSubTab === "architecture" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual UML Relationship Mapping Simulator */}
            <div className="lg:col-span-2 p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Flussi dei Dati & Moduli di Integrazione (UML)</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Struttura ricostruita sintatticamente tramite AST parser</p>
              </div>

              {/* Graphical Box */}
              <div className="p-4 bg-barbg border border-zinc-800 rounded-xl space-y-4 font-mono text-[11px]">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>MODULO CHIAVE</span>
                  <span>RELAZIONE</span>
                  <span>DESTINAZIONE</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-appbg border border-zinc-800 rounded-lg">
                    <span className="text-sky-400">src/services/auth.service.ts</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-emerald-400">src/api/auth/v1/session.go</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-appbg border border-zinc-800 rounded-lg">
                    <span className="text-sky-400">src/api/auth/v1/session.go</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-yellow-400">src/db/queries.sql</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-appbg border border-zinc-800 rounded-lg">
                    <span className="text-violet-400">kubernetes/deployment.yaml</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-sky-400">src/services/auth.service.ts</span>
                  </div>
                </div>

                <div className="p-3 bg-appbg border border-emerald-950 text-xs text-zinc-400 rounded-lg leading-relaxed font-sans">
                  <strong>Pattern Rilevato:</strong> <span className="text-emerald-400">Facade Architecture</span>. Il servizio <code>auth.service.ts</code> agisce come punto d'accesso unico per verificare l'autenticazione tramite un proxy gRPC verso il microservizio Go.
                </div>
              </div>
            </div>

            {/* Assisted Refactoring Panel */}
            <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Refactoring Assistito locale</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Rinomina classi e funzioni aggiornando tutti i riferimenti offline</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">FILE DA MODIFICARE</span>
                  <select
                    value={selectedRefactorFile}
                    onChange={(e) => setSelectedRefactorFile(e.target.value)}
                    className="w-full bg-appbg border border-zinc-800 rounded p-2 text-zinc-200 font-mono focus:outline-none"
                  >
                    <option value="src/services/auth.service.ts">src/services/auth.service.ts</option>
                    <option value="src/api/auth/v1/session.go">src/api/auth/v1/session.go</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">NOME ORIGINALE</span>
                  <input
                    type="text"
                    value={refactorOriginalName}
                    onChange={(e) => setRefactorOriginalName(e.target.value)}
                    className="w-full bg-appbg border border-zinc-800 rounded p-2 text-zinc-200 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">NUOVO NOME</span>
                  <input
                    type="text"
                    value={refactorNewName}
                    onChange={(e) => setRefactorNewName(e.target.value)}
                    className="w-full bg-appbg border border-zinc-800 rounded p-2 text-zinc-200 font-mono focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleApplyRefactor}
                  disabled={isApplyingRefactor}
                  className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-800 py-2 rounded font-mono font-bold transition"
                >
                  {isApplyingRefactor ? "Calcolo referenze in corso..." : "Esegui Refactoring (Genera Patch)"}
                </button>

                {refactorSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-[11px] rounded-lg font-mono">
                    <strong>PATCH APPLICATA CON SUCCESSO!</strong> Riferimenti aggiornati in 4 file del workspace.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* SUB TAB D: SECURITY OWASP */}
        {activeSubTab === "security" && (
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Vulnerabilità e Sicurezza del Codice</h4>
                <p className="text-[11px] text-zinc-500">Ricerca credenziali esposte, XSS, CSRF e vulnerabilità di dipendenze</p>
              </div>
            </div>

            <div className="space-y-3">
              {mockVulnerabilities.map((v) => (
                <div key={v.id} className="p-4 bg-barbg border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                          v.severity === "High"
                            ? "bg-red-950/40 text-red-400 border-red-900/60"
                            : v.severity === "Medium"
                            ? "bg-amber-950/40 text-amber-400 border-amber-900/60"
                            : "bg-blue-950/40 text-blue-400 border-blue-900/60"
                        }`}>
                          {v.severity} Severity
                        </span>
                        <span className="text-zinc-200 font-mono font-bold text-xs">{v.type}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono block">File: {v.file} (Riga {v.line})</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {v.description}
                  </p>

                  <div className="p-3 bg-appbg border border-zinc-850 rounded-lg text-xs">
                    <span className="font-bold text-emerald-400 font-mono block mb-1">Rimedio raccomandato:</span>
                    <p className="text-zinc-400 font-mono text-[11px]">{v.remediation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB TAB E: PERFORMANCE BOTTLENECKS */}
        {activeSubTab === "performance" && (
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Ottimizzazioni & Colli di Bottiglia Hardware</h4>
                <p className="text-[11px] text-zinc-500">Riconoscimento cicli infiniti, query lente e possibili memory leaks</p>
              </div>
            </div>

            <div className="space-y-3">
              {mockPerformanceIssues.map((p) => (
                <div key={p.id} className="p-4 bg-barbg border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span className="font-mono text-xs font-bold text-zinc-200">{p.type}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-red-950/30 text-red-400 border border-red-900 px-1.5 py-0.2 rounded uppercase">
                      Impatto {p.impact}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono block">Ubicazione: {p.file} (Riga {p.line})</span>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {p.description}
                  </p>

                  <div className="p-3 bg-appbg border border-zinc-850 rounded-lg text-[11px] font-mono text-zinc-400">
                    <strong className="text-emerald-400 block mb-1">Suggerimento ottimizzazione:</strong>
                    {p.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB TAB F: SEMANTIC SEARCH */}
        {activeSubTab === "semantic" && (
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">Interrogazione Semantica locale (Embedding Vettoriali)</h4>
                <p className="text-[11px] text-zinc-500">Sfrutta l'indice locale per rintracciare dipendenze e chiamate complesse</p>
              </div>
            </div>

            {/* Input Search Form */}
            <form onSubmit={handleSemanticSearch} className="flex gap-2 bg-barbg p-3 border border-zinc-800 rounded-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Esempio: 'Dove viene definita la sessione utente?' o 'Quali query accedono al db?'"
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                  className="w-full bg-appbg border border-zinc-800 rounded-lg py-1.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                {isSearching && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Invia Query</span>
              </button>
            </form>

            {/* Search results display */}
            <div className="space-y-3 mt-4" id="semantic-search-results">
              {isSearching ? (
                <div className="text-center py-8 text-zinc-500 font-mono text-xs animate-pulse">
                  Generazione embedding locali ed interrogazione del database vettoriale locale...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((res, i) => (
                  <div key={i} className="p-4 bg-barbg border border-zinc-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">{res.file} (Riga {res.line})</span>
                      <span className="text-zinc-500">Rilevanza: {res.relevance}%</span>
                    </div>
                    <pre className="p-3 bg-appbg text-zinc-300 border border-zinc-850 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
                      {res.context}
                    </pre>
                  </div>
                ))
              ) : semanticQuery ? (
                <div className="text-center py-6 text-zinc-600 text-xs italic">
                  Nessun risultato corrispondente nell'indice locale. Prova a digitare 'sessione' o 'query'.
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-500 text-xs font-sans">
                  Digita una domanda sopra per cercare istantaneamente all'interno dell'intero progetto (100.000+ file) senza latenza di rete.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
