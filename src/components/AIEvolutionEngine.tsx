import React from "react";
import { Brain, AlertTriangle } from "lucide-react";

export default function AIEvolutionEngine() {
  return (
    <div className="space-y-6" id="ai-evolution-engine-main">
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
      </div>

      <div className="p-12 border border-dashed border-zinc-800 rounded-xl text-center bg-[#0a0a0a]/50">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4 opacity-80" />
        <h3 className="text-lg font-medium text-zinc-300">Funzione Non Ancora Disponibile (Fase 10)</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl mx-auto">
          In ottemperanza alle direttive SRS Enterprise, le simulazioni grafiche e statiche del motore evolutivo e della memoria distribuita sono state rimosse. L'AEE (AI Evolution Engine) verrà sviluppato una volta stabilizzati il Knowledge Engine, il Memory Engine e il Project Indexer nel backend.
        </p>
      </div>
    </div>
  );
}
