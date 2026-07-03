import React, { useState } from "react";
import {
  Blocks,
  CheckCircle,
  Download,
  Trash2,
  Terminal,
  Code2,
  Lock,
  Globe,
  Settings,
} from "lucide-react";
import { Plugin } from "../types";

interface PluginCenterProps {
  plugins: Plugin[];
  onTogglePlugin: (pluginId: string) => void;
}

export default function PluginCenter({ plugins, onTogglePlugin }: PluginCenterProps) {
  const [activeSubTab, setActiveSubTab] = useState<"store" | "api">("store");
  const [copied, setCopied] = useState(false);

  const handleCopyApi = () => {
    navigator.clipboard.writeText("http://localhost:3000/v1/chat/completions");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="plugin-center-tab">
      <div className="flex border-b border-zinc-800 space-x-4 bg-barbg p-2 rounded-xl" id="plugin-submenu">
        <button
          onClick={() => setActiveSubTab("store")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "store" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Plugin Marketplace
        </button>
        <button
          onClick={() => setActiveSubTab("api")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === "api" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          API Locali per Sviluppatori
        </button>
      </div>

      {activeSubTab === "store" ? (
        <div className="p-12 border border-dashed border-zinc-800 rounded-xl text-center bg-[#0a0a0a]/50">
          <Blocks className="w-10 h-10 text-amber-500 mx-auto mb-4 opacity-80" />
          <h3 className="text-lg font-medium text-zinc-300">Plugin Store Non Ancora Disponibile</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
            In ottemperanza alle direttive SRS Enterprise, la simulazione dei plugin è stata rimossa. Il sistema di gestione dei plugin reali sarà implementato nella Fase 4.
          </p>
        </div>
      ) : (
        <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-6" id="api-developer-panel">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              API Locale Compatibile con OpenAI
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              AI Hub espone localmente un server web che simula l'interfaccia delle API di OpenAI. Puoi configurare qualsiasi estensione o client software per utilizzarlo.
            </p>
          </div>

          <div className="bg-barbg p-4 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500">ENDPOINT LOCALE</span>
              <button
                onClick={handleCopyApi}
                className="text-xs text-emerald-400 font-mono hover:underline"
              >
                {copied ? "Copiato!" : "Copia URL"}
              </button>
            </div>
            <div className="font-mono text-xs text-zinc-200 bg-appbg p-2.5 rounded border border-zinc-800 truncate select-all">
              http://localhost:3000/v1/chat/completions
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              Esempi di Integrazione
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs text-zinc-500 font-mono">Test di Connessione con cURL</span>
                <pre className="p-3 bg-barbg text-zinc-400 border border-zinc-800 rounded-lg text-[10px] font-mono leading-relaxed overflow-x-auto">
{`curl http://localhost:3000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama-3.2",
    "messages": [{"role": "user", "content": "Ciao"}]
  }'`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-zinc-500 font-mono">Configurazione Python SDK</span>
                <pre className="p-3 bg-barbg text-zinc-400 border border-zinc-800 rounded-lg text-[10px] font-mono leading-relaxed overflow-x-auto">
{`from openai import OpenAI
 
client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="ai-hub-key-locale-fittizia"
)
 
response = client.chat.completions.create(
    model="llama-3.2",
    messages=[{"role": "user", "content": "Ciao!"}]
)`}
                </pre>
              </div>
            </div>
          </div>

          <div className="p-3 bg-barbg/40 border border-zinc-800 rounded-lg flex gap-1.5 text-xs text-zinc-500">
            <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Privacy di default:</strong> Le richieste inviate a questo endpoint locale non lasciano MAI il tuo computer. L'elaborazione viene eseguita interamente offline sui thread locali.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
