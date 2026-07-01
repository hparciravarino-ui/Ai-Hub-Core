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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="plugins-list-grid">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="p-4 bg-panelbg border border-zinc-800 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                        {plugin.category}
                      </span>
                      {plugin.signed ? (
                        <span className="text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded font-bold">
                          FIRMATE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono bg-amber-950/40 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded font-bold">
                          COMMUNITY
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-100 mt-2">{plugin.name}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono">Autore: {plugin.author} • v{plugin.version}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {plugin.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                <span className="text-xs text-zinc-500 font-mono">Rating: {plugin.rating} / 5</span>
                
                {plugin.installed ? (
                  <button
                    onClick={() => onTogglePlugin(plugin.id)}
                    className="flex items-center space-x-1 border border-red-900 hover:bg-red-950/40 text-red-400 font-semibold px-2.5 py-1 rounded text-xs transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Rimuovi</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onTogglePlugin(plugin.id)}
                    className="flex items-center space-x-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold px-2.5 py-1 rounded text-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Installa</span>
                  </button>
                )}
              </div>
            </div>
          ))}
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
