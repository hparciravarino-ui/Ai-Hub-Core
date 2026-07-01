import React, { useState } from "react";
import {
  Download,
  Trash2,
  Search,
  CheckCircle,
  FileText,
  Clock,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Sparkles,
  Info,
} from "lucide-react";
import { Model, HardwareProfile } from "../types";

interface ModelManagerProps {
  currentHardware: HardwareProfile;
  models: Model[];
  onDownloadModel: (modelId: string) => void;
  onDeleteModel: (modelId: string) => void;
  downloadSpeed?: "standard" | "turbo" | "instant";
  onDownloadSpeedChange?: (speed: "standard" | "turbo" | "instant") => void;
  onDownloadAll?: () => void;
  onDeleteAll?: () => void;
  onAddNewModel?: (newModel: Model) => void;
}

export default function ModelManager({
  currentHardware,
  models,
  onDownloadModel,
  onDeleteModel,
  downloadSpeed = "turbo",
  onDownloadSpeedChange,
  onDownloadAll,
  onDeleteAll,
  onAddNewModel,
}: ModelManagerProps) {
  const [activeTab, setActiveTab] = useState<"installed" | "marketplace" | "search_online">("installed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // Online Search States
  const [onlineSearchQuery, setOnlineSearchQuery] = useState("");
  const [onlineSearchResults, setOnlineSearchResults] = useState<any[]>([]);
  const [onlineCitations, setOnlineCitations] = useState<{ title: string; url: string }[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineSearchError, setOnlineSearchError] = useState<string | null>(null);
  const [addedModelIds, setAddedModelIds] = useState<Record<string, boolean>>({});
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [backupReason, setBackupReason] = useState("");

  const handleSearchOnline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onlineSearchQuery.trim()) return;

    setIsSearchingOnline(true);
    setOnlineSearchError(null);
    setOnlineSearchResults([]);
    setOnlineCitations([]);
    setIsBackupMode(false);
    setBackupReason("");

    try {
      const res = await fetch("/api/models/search-online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: onlineSearchQuery }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Errore sconosciuto nella ricerca online");
      }

      const data = await res.json();
      setOnlineSearchResults(data.models || []);
      setOnlineCitations(data.citations || []);
      setIsBackupMode(!!data.isBackupMode);
      setBackupReason(data.backupReason || "");
    } catch (err: any) {
      console.error(err);
      setOnlineSearchError(err?.message || "Impossibile completare la ricerca online. Verifica la connessione e la chiave API.");
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const handleAddModelToCatalog = (model: any) => {
    if (onAddNewModel) {
      const newModel: Model = {
        id: model.id,
        name: model.name,
        category: model.category,
        size: model.size,
        quant: model.quant,
        ramRequired: model.ramRequired,
        vramRequired: model.vramRequired,
        estimatedSpeed: model.estimatedSpeed,
        description: model.description,
        downloaded: false,
        downloadProgress: 0,
        isDownloading: false,
        rating: model.rating,
        format: model.format,
        digitalSignature: model.digitalSignature,
        sha256: model.sha256,
        version: model.version
      };
      onAddNewModel(newModel);
      setAddedModelIds((prev) => ({ ...prev, [model.id]: true }));
    }
  };

  const selectedModel = models.find(m => m.id === selectedModelId) || null;

  const categories = ["All", "Chat", "Reasoning", "Coding", "Writing", "Audio", "ImageGen"];

  // Filter models
  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || model.category === selectedCategory;
    const matchesTab = activeTab === "installed" ? model.downloaded : !model.downloaded;

    return matchesSearch && matchesCategory && matchesTab;
  });

  // Check if current system meets RAM requirements
  const getHardwareCompatibility = (model: Model) => {
    if (currentHardware.ram >= model.ramRequired) {
      return { status: "Perfect", color: "text-emerald-400 bg-emerald-950 border-emerald-800", text: "Pienamente Compatibile" };
    } else if (currentHardware.ram + 4 >= model.ramRequired) {
      return { status: "Warning", color: "text-amber-400 bg-amber-950 border-amber-800", text: "RAM Limite (Richiede Swap SSD)" };
    } else {
      return { status: "Incompatible", color: "text-red-400 bg-red-950 border-red-800", text: "RAM Insufficiente (Rischio Crash)" };
    }
  };

  const handleDownloadClick = (modelId: string) => {
    onDownloadModel(modelId);
  };

  return (
    <div className="space-y-6" id="model-manager-tab">
      {/* Search and Tabs Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-barbg p-4 border border-zinc-800 rounded-xl" id="search-filter-panel">
        <div className="flex bg-[#050505] border border-zinc-850 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("installed")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "installed"
                ? "bg-zinc-800/80 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Modelli Installati ({models.filter((m) => m.downloaded).length})
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "marketplace"
                ? "bg-zinc-800/80 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Marketplace Open Source ({models.filter((m) => !m.downloaded).length})
          </button>
          <button
            onClick={() => setActiveTab("search_online")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "search_online"
                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Search className="w-3 h-3" />
            <span>Cerca Nuovi Modelli</span>
          </button>
        </div>

        {activeTab !== "search_online" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedCategory === cat
                      ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold"
                      : "bg-panelbg text-zinc-400 border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca modello..."
                className="w-full bg-panelbg border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </>
        )}

        {activeTab === "search_online" && (
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 bg-[#0a0a0a] px-3 py-1.5 rounded-lg border border-zinc-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Motore di Ricerca AI Hub Attivo
          </div>
        )}
      </div>

      {/* ACCELERATORE E STRUMENTI IN BLOCCO */}
      <div className="bg-zinc-900/40 p-4 border border-zinc-800 rounded-xl space-y-3" id="network-accelerator-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Acceleratore di Rete AI Hub
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Scegli la velocità del server di sintonizzazione locale e gestisci i pesi in blocco.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {onDownloadSpeedChange && (
              <div className="flex items-center gap-2 bg-appbg px-3 py-1.5 rounded-lg border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Velocità:</span>
                <div className="flex gap-1">
                  {(["standard", "turbo", "instant"] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => onDownloadSpeedChange(spd)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                        downloadSpeed === spd
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-900/60"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {spd === "standard" ? "Standard" : spd === "turbo" ? "Turbo 5G" : "Istantaneo"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {onDownloadAll && (
                <button
                  onClick={onDownloadAll}
                  className="bg-emerald-950/60 border border-emerald-900/80 hover:bg-emerald-900 text-emerald-400 font-semibold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Installa Tutti</span>
                </button>
              )}
              {onDeleteAll && (
                <button
                  onClick={onDeleteAll}
                  className="bg-red-950/40 border border-red-900/60 hover:bg-red-900 text-red-400 font-semibold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Rimuovi Tutti</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === "search_online" ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Search Input Card */}
            <form onSubmit={handleSearchOnline} className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Cerca Modelli Open Source in Tempo Reale</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Interroga il Web tramite il nostro assistente con Google Search Grounding per trovare gli ultimi pesi rilasciati su Hugging Face o Ollama (es. <em>"Gemma 2 2b IT"</em>, <em>"Llama 3.3 8b"</em>, <em>"DeepSeek R1"</em>, <em>"Phi-4"</em>).
              </p>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={onlineSearchQuery}
                    onChange={(e) => setOnlineSearchQuery(e.target.value)}
                    placeholder="Scrivi es. 'Deepseek-R1' oppure 'Gemma 2'..."
                    className="w-full bg-appbg border border-zinc-800 rounded-lg py-2.5 pl-9 pr-4 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingOnline || !onlineSearchQuery.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold px-5 py-2.5 rounded-lg text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isSearchingOnline ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Ricerca in corso...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Cerca nel Web</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {onlineSearchError && (
              <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-400 text-xs rounded-xl">
                ⚠️ {onlineSearchError}
              </div>
            )}

            {/* Search Loading Screen */}
            {isSearchingOnline && (
              <div className="p-12 text-center bg-panelbg border border-zinc-800 rounded-xl space-y-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 border-2 border-t-emerald-500 rounded-full animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-zinc-200">Interrogazione in rete con Google Search Grounding...</div>
                  <div className="text-xs text-zinc-500 font-mono">Scansione di huggingface.co, ollama.com e paper accademici per trovare i pesi richiesti.</div>
                </div>
              </div>
            )}

            {/* Backup Mode Banner */}
            {!isSearchingOnline && isBackupMode && (
              <div className="p-4 bg-amber-950/20 border border-amber-900/60 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Server Speculare di AI Hub Attivo (Sincronizzazione di Backup)
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {backupReason || "La quota principale di ricerca online è attualmente esaurita. Per garantirti continuità, abbiamo caricato i pesi e le specifiche tecniche compatibili dal nostro database speculare. Puoi scaricare e installare liberamente questi modelli nel catalogo locale."}
                </p>
              </div>
            )}

            {/* Search Results */}
            {!isSearchingOnline && onlineSearchResults.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Risultati della Ricerca ({onlineSearchResults.length})
                </div>

                <div className="space-y-4">
                  {onlineSearchResults.map((model) => {
                    const isAlreadyAdded = models.some((m) => m.id === model.id) || addedModelIds[model.id];
                    return (
                      <div
                        key={model.id}
                        className="p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-4 hover:border-zinc-700 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono bg-zinc-800/40 text-zinc-300 px-2 py-0.5 rounded">
                                {model.category}
                              </span>
                              <span className="text-xs font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded">
                                {model.quant}
                              </span>
                              <span className="text-xs font-mono bg-blue-950/40 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded">
                                {model.format}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-zinc-100 mt-2">{model.name}</h4>
                            <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Versione: {model.version} • Autore: {model.digitalSignature}</div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono text-zinc-500">Dimensione</span>
                            <div className="text-sm font-bold text-emerald-400">{model.size}</div>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {model.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-800/60">
                          <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                            <span>RAM: <strong className="text-zinc-300">{model.ramRequired}GB</strong></span>
                            {model.vramRequired > 0 && (
                              <span>VRAM: <strong className="text-zinc-300">{model.vramRequired}GB</strong></span>
                            )}
                            <span>Velocità: <strong className="text-emerald-400">~{model.estimatedSpeed} tok/s</strong></span>
                          </div>

                          <div className="flex items-center gap-2">
                            {model.sourceUrl && (
                              <a
                                href={model.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-2.5 py-1.5 rounded-lg font-mono transition"
                              >
                                Hugging Face ↗
                              </a>
                            )}
                            
                            {isAlreadyAdded ? (
                              <button
                                disabled
                                className="bg-zinc-800 text-zinc-500 font-bold px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-default"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Aggiunto al Catalogo</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddModelToCatalog(model)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Importa nel Catalogo</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Citations Panel */}
            {!isSearchingOnline && onlineCitations.length > 0 && (
              <div className="p-4 bg-zinc-950/50 border border-zinc-900 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Fonti Web Rilevate (Google Search Grounding)
                </div>
                <ul className="space-y-1.5">
                  {onlineCitations.map((citation, idx) => (
                    <li key={idx} className="text-xs text-zinc-500 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-semibold shrink-0">[{idx + 1}]</span>
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-zinc-300 underline transition truncate max-w-full block"
                      >
                        {citation.title || citation.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty Search Prompt */}
            {!isSearchingOnline && onlineSearchResults.length === 0 && (
              <div className="p-12 text-center bg-panelbg border border-zinc-800 rounded-xl text-zinc-500">
                <Search className="w-8 h-8 mx-auto text-zinc-700 mb-3" />
                <p className="text-sm font-semibold text-zinc-400">Nessun modello cercato in rete.</p>
                <p className="text-xs text-zinc-500 mt-1">Usa la barra di ricerca in alto per interrogare Hugging Face e Ollama in tempo reale.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2" id="models-list">
            {filteredModels.length === 0 ? (
              <div className="text-center p-12 bg-panelbg border border-zinc-800 rounded-xl text-zinc-400">
                <Sparkles className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                Nessun modello trovato in questa categoria.
              </div>
            ) : (
              filteredModels.map((model) => {
                const comp = getHardwareCompatibility(model);
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`p-4 bg-panelbg border transition-all rounded-xl cursor-pointer hover:border-zinc-700 ${
                      selectedModelId === model.id ? "border-emerald-500 bg-panelbg/95 shadow-md" : "border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono bg-zinc-800/40 text-zinc-300 px-2 py-0.5 rounded">
                            {model.category}
                          </span>
                          <span className="text-xs font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded">
                            {model.quant}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-zinc-100 mt-2">{model.name}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-zinc-400">Dimensione</span>
                        <div className="text-sm font-semibold text-zinc-200">{model.size}</div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {model.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-800">
                      <div className="flex items-center space-x-3 text-xs text-zinc-400 font-mono">
                        <span>RAM Min: <strong className="text-zinc-200">{model.ramRequired}GB</strong></span>
                        {model.vramRequired > 0 && (
                          <span>VRAM Min: <strong className="text-zinc-200">{model.vramRequired}GB</strong></span>
                        )}
                        <span>Format: <strong className="text-sky-400">{model.format}</strong></span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Compatibility Badge */}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${comp.color}`}>
                          {comp.text}
                        </span>

                        {/* Download Status */}
                        {model.isDownloading ? (
                          <div className="flex items-center space-x-2 text-xs text-emerald-400">
                            <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 animate-pulse" style={{ width: `${model.downloadProgress}%` }} />
                            </div>
                            <span className="font-mono text-[10px]">{model.downloadProgress}%</span>
                          </div>
                        ) : model.downloaded ? (
                          <span className="flex items-center space-x-1 text-emerald-400 text-xs">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono">Disponibile</span>
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadClick(model.id);
                            }}
                            className="flex items-center space-x-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-2.5 py-1 rounded text-xs transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Installa</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Selected Model Details Sheet */}
        <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl flex flex-col justify-between" id="model-details-sheet">
          {selectedModel ? (
            <div className="space-y-4">
              <div className="border-b border-zinc-800 pb-3">
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase">
                  {selectedModel.category}
                </span>
                <h3 className="text-lg font-semibold text-zinc-100 mt-2">{selectedModel.name}</h3>
                <div className="text-xs text-zinc-400 mt-1">Eseguibile locale • Versione {selectedModel.version}</div>
              </div>

              {/* Model Specs */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-zinc-800/50 pb-1.5">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" /> Quantizzazione:
                  </span>
                  <span className="font-mono font-semibold text-zinc-200">{selectedModel.quant}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/50 pb-1.5">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-violet-400" /> Velocità stimata su PC:
                  </span>
                  <span className="font-mono font-semibold text-emerald-400">~{selectedModel.estimatedSpeed} tok/sec</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/50 pb-1.5">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Firma Digitale:
                  </span>
                  <span className="font-mono text-[11px] text-zinc-300 truncate max-w-[150px]">
                    {selectedModel.digitalSignature}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/50 pb-1.5">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" /> Hash SHA256:
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[150px]">
                    {selectedModel.sha256}
                  </span>
                </div>
              </div>

              <div className="bg-appbg p-3 rounded-lg border border-zinc-800 text-xs">
                <div className="font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-500" /> Analisi Hardware Locale:
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Questo modello richiede <strong>{selectedModel.ramRequired}GB</strong> di RAM per caricarsi. Su questa macchina ({currentHardware.ram}GB RAM), l'allocazione risulterà{" "}
                  {currentHardware.ram >= selectedModel.ramRequired ? (
                    <strong className="text-emerald-400">ottimale e sicura senza swap</strong>
                  ) : (
                    <strong className="text-yellow-400">critica, richiedendo swap o compressione di contesto</strong>
                  )}
                  .
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                {selectedModel.downloaded ? (
                  <button
                    onClick={() => onDeleteModel(selectedModel.id)}
                    className="w-full bg-red-950/40 border border-red-900/60 hover:bg-red-900/80 text-red-200 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Disinstalla Modello</span>
                  </button>
                ) : selectedModel.isDownloading ? (
                  <div className="text-center p-2.5 bg-appbg border border-zinc-800 rounded-lg">
                    <div className="text-xs text-emerald-400 font-semibold mb-1">Download in corso...</div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-emerald-500" style={{ width: `${selectedModel.downloadProgress}%` }} />
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">{selectedModel.downloadProgress}% completato</div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownloadClick(selectedModel.id)}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Scarica e Installa</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 my-auto">
              <Info className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
              Seleziona un modello dalla lista per visualizzarne la scheda tecnica dettagliata.
            </div>
          )}

          <div className="text-[10px] text-zinc-500 mt-4 leading-normal text-center bg-appbg/50 p-2.5 border border-zinc-800/40 rounded-lg">
            I modelli distribuiti nell'AI Hub provengono da repository controllati. Ognuno viene sottoposto a firma digitale e controllo di integrità malware prima del caricamento.
          </div>
        </div>
      </div>
    </div>
  );
}
