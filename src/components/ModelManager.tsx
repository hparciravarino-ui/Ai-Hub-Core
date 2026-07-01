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
}

export default function ModelManager({
  currentHardware,
  models,
  onDownloadModel,
  onDeleteModel,
}: ModelManagerProps) {
  const [activeTab, setActiveTab] = useState<"installed" | "marketplace">("installed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

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
        </div>

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
      </div>

      {/* Main Grid: List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Cards List */}
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
                  onClick={() => setSelectedModel(model)}
                  className={`p-4 bg-panelbg border transition-all rounded-xl cursor-pointer hover:border-zinc-700 ${
                    selectedModel?.id === model.id ? "border-emerald-500 bg-panelbg/95 shadow-md" : "border-zinc-800"
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
                          className="flex items-center space-x-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-2.5 py-1 rounded text-xs transition"
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
