import React from "react";
import { Folder, AlertTriangle } from "lucide-react";

export default function ProjectAnalyzer() {
  return (
    <div className="space-y-6" id="project-analyzer-tab">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-barbg p-4 border border-zinc-800 rounded-xl" id="analyzer-presets-bar">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Analizzatore Progetto Locale
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500">
            Scansione progressiva ad alte prestazioni per mappare architettura, vulnerabilità e colli di bottiglia offline.
          </p>
        </div>
      </div>

      <div className="p-12 border border-dashed border-zinc-800 rounded-xl text-center bg-[#0a0a0a]/50">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4 opacity-80" />
        <h3 className="text-lg font-medium text-zinc-300">Funzione Non Ancora Disponibile (Fase 4 e Fase 11)</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl mx-auto">
          In ottemperanza alle direttive SRS Enterprise, la simulazione fittizia (fake scanning, dummy vulnerabilities, e mock file list) è stata completamente rimossa. Il Project Analyzer reale sarà implementato nelle fasi successive, quando il backend disporrà di un motore AST e un Vector Database locale funzionanti.
        </p>
      </div>
    </div>
  );
}
