import React from "react";
import { 
  BookOpen, 
  LayoutDashboard, 
  Database, 
  Sliders, 
  Cpu, 
  MessageSquare, 
  Folder, 
  Brain, 
  ListOrdered, 
  Blocks, 
  ShieldCheck,
  Key,
  Layers,
  FileUp
} from "lucide-react";

export default function UserGuide() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-appbg text-zinc-200">
      {/* Header */}
      <div className="shrink-0 p-5 border-b border-zinc-800 bg-panelbg flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/50 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-display tracking-tight text-zinc-100 uppercase">
            Guida all'Uso Dettagliata
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            Manuale operativo completo per l'architettura organizzata di AI Hub Enterprise
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* Introduction */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" /> Introduzione al Sistema
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Benvenuto in <strong>AI Hub Enterprise</strong>. La piattaforma è stata ottimizzata per ridurre la complessità e offrire un'esperienza utente organizzata in compartimenti stagni. Tutte le funzionalità sono distribuite in quattro comodi sotto-menù raggruppati per scopo funzionale e codice cromatico. Ogni funzione obsoleta o duplicata è stata rimossa per garantire la massima efficienza e velocità.
          </p>
        </section>

        {/* Nuova Navigazione Sotto-Menù */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
            La Nuova Struttura dei Sotto-Menù Cromatici
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Per facilitare l'orientamento, la barra di navigazione laterale è suddivisa in 4 sezioni collassabili ed espanse di default:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sotto-menu Emerald */}
            <div className="border border-emerald-500/20 bg-emerald-950/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Chat & Assistenza (Verde)
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Include il <strong>Sistema Chat Pro</strong> (l'interfaccia di conversazione principale), il <strong>Playground & Tools</strong> per i test rapidi, e questa <strong>Guida all'Uso</strong>.
              </p>
            </div>

            {/* Sotto-menu Sky */}
            <div className="border border-sky-500/20 bg-sky-950/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                Sistema & Controllo (Azzurro)
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Raccoglie il <strong>Pannello Controllo</strong>, la gestione dei <strong>Provider AI</strong>, la diagnostica di <strong>Sistema & Telemetria</strong>, e la procedura guidata di <strong>Installazione & Setup</strong>.
              </p>
            </div>

            {/* Sotto-menu Purple */}
            <div className="border border-purple-500/20 bg-purple-950/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Intelligenza & Modelli (Viola)
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Focalizzato sui modelli neurali: <strong>Gestione Modelli</strong> (scaricamento del catalogo), l'<strong>Intelligence Engine</strong> per l'allocazione hardware, il <strong>Motore Evolutivo (AEE)</strong>, e la piattaforma di <strong>Benchmark</strong> prestazionale.
              </p>
            </div>

            {/* Sotto-menu Amber */}
            <div className="border border-amber-500/20 bg-amber-950/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Strumenti di Sviluppo (Arancione)
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                La cassetta degli attrezzi professionale: <strong>Piattaforma RAG</strong> per l'indicizzazione vettoriale, <strong>Team Multi-Agenti</strong>, <strong>Workflow Automazione</strong>, <strong>Scheduler Coda</strong>, <strong>Plugin Estensioni</strong>, <strong>Sicurezza & Privacy</strong>, <strong>File Manager IO</strong>, <strong>Analisi Progetto</strong>, e il <strong>Media Lab</strong>.
              </p>
            </div>

          </div>
        </section>

        {/* Nuova Ingestion Drag & Drop */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <FileUp className="w-4 h-4 text-emerald-400" /> Novità: Upload Batch Ingest nella Chat Attiva
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            È ora possibile effettuare il <strong>caricamento in blocco di file e cartelle</strong> trascinando i file direttamente sopra l'area di input della chat del <strong>Sistema Chat Pro</strong>. Un overlay interattivo gestito dall'API standard <code>DataTransfer</code> leggerà i file istantaneamente, avviando l'indicizzazione del contenuto e l'estrazione OCR per renderli consultabili dai modelli AI selezionati in tempo reale.
          </p>
        </section>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

          {/* Chat Pro */}
          <div className="bg-panelbg border border-zinc-800/60 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-zinc-100">Sistema Chat Pro</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Interfaccia avanzata multi-tab. Supporta chat simultanee con modelli diversi. Puoi regolare parametri come la Temperatura e il 
              Top P. Se utilizzi OpenRouter, puoi connetterti a modelli cloud remoti reali.
            </p>
          </div>

          {/* Security & Keys */}
          <div className="bg-panelbg border border-zinc-800/60 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <h4 className="text-sm font-bold text-zinc-100">Sicurezza & Chiavi API</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gestisci le credenziali sensibili in sicurezza. Le chiavi per <strong>OpenRouter</strong> o <strong>Gemini</strong> rimangono protette lato server e nel browser locale, sbloccando la validazione live e le chiamate di inferenza reale.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
