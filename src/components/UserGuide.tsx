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
  Key
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
            Manuale operativo completo per tutte le funzionalità del simulatore AI Hub
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Introduction */}
        <section className="bg-barbg border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-2">Introduzione</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Benvenuto in AI Hub Core OpenSource. Questa piattaforma è progettata per offrirti un ambiente simulato per il download, 
            l'ottimizzazione e l'esecuzione di modelli AI (LLM, ImageGen, Audio, ecc.) in locale e tramite cloud (OpenRouter). 
            Usa il pannello di controllo per monitorare le tue risorse hardware virtuali, installare nuovi modelli, configurare l'accesso API, 
            e testare i modelli in diverse interfacce di chat e analisi.
          </p>
        </section>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Dashboard */}
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-bold text-zinc-100">Pannello di Controllo</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Il centro nevralgico del sistema. Visualizza metriche in tempo reale sullo stato del server, configurazione API (Gemini e OpenRouter), 
              ping locale, e le risorse hardware in uso. Monitora il livello di carico simulato per assicurarti che i parametri di esecuzione siano stabili.
            </p>
          </div>

          {/* Model Manager */}
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-sky-400" />
              <h4 className="text-sm font-bold text-zinc-100">Gestione Modelli</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sfoglia il catalogo dei modelli AI open-source (Llama, DeepSeek, Phi, ecc.). Puoi ricercare modelli reali online grazie all'integrazione 
              diretta con OpenRouter, simulare il download, o gestire le versioni "scaricate". Usa questo modulo per aggiungere modelli personalizzati al tuo ambiente.
            </p>
          </div>

          {/* Optimizer */}
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-zinc-100">Ottimizzazione Hardware</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Configura il profilo hardware (fascia bassa, media, o personalizzato) e il livello di prestazioni (Equilibrato, Estremo, ecc.).
              Esegui la <strong>Diagnostica AI</strong> per ricevere consigli automatizzati sui parametri ottimali (es. thread, layer VRAM) in base all'hardware selezionato.
            </p>
          </div>

          {/* Playground & AI Tools */}
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-violet-400" />
              <h4 className="text-sm font-bold text-zinc-100">Playground & AI Tools</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Un ambiente di test rapido per verificare il comportamento dei modelli "scaricati". Include strumenti per il monitoraggio della generazione 
              dei token e un'interfaccia base per il prompt testing.
            </p>
          </div>

          {/* Professional Chat */}
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-zinc-100">Sistema Chat Pro</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Interfaccia avanzata multi-tab. Supporta chat simultanee con modelli diversi. Puoi regolare parametri come la Temperatura e il 
              Top P. <strong>Nota:</strong> Se selezioni modelli cloud online (tramite OpenRouter), i messaggi verranno generati usando l'API reale.
            </p>
          </div>

          {/* Project Analyzer */}
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Folder className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-zinc-100">Analisi Progetto</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Modulo specializzato per analizzare il codice sorgente o architetture progettuali. Carica frammenti o definizioni e sfrutta l'AI 
              per identificare bug, vulnerabilità o ottimizzazioni.
            </p>
          </div>

          {/* AEE */}
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-zinc-100">Motore Evolutivo (AEE)</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Simulatore del processo di auto-evoluzione del sistema (Auto-Evolution Engine). Visualizza il progresso di adattamento e l'apprendimento 
              simulato del modello rispetto a nuovi task o pattern di utilizzo.
            </p>
          </div>

          {/* Scheduler & Plugins */}
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ListOrdered className="w-4 h-4 text-zinc-400" />
              <Blocks className="w-4 h-4 text-zinc-400 ml-1" />
              <h4 className="text-sm font-bold text-zinc-100">Scheduler & Plugin</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong>Scheduler Coda:</strong> Monitora le code di inferenza per i task in batch e la latenza dei worker.<br/>
              <strong>Plugin Estensioni:</strong> Abilita integrazioni modulari come Ricerca Web, Esecuzione Codice Python o RAG per espandere le capacità dei modelli.
            </p>
          </div>

          {/* Security & Config */}
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-5 space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <Key className="w-4 h-4 text-violet-400 ml-1" />
              <h4 className="text-sm font-bold text-zinc-100">Sicurezza, Privacy & Configurazione API Keys</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Modulo critico per la gestione dell'ambiente. <br/><br/>
              - <strong>Log Eventi:</strong> Esamina la cronologia delle azioni di sicurezza, rilevamenti minacce o firme corrotte.<br/>
              - <strong>Toggle Offline:</strong> Simula il blocco del traffico in uscita per testare i modelli in isolamento totale (air-gapped).<br/>
              - <strong>API Keys (Gemini & OpenRouter):</strong> Inserisci le tue chiavi API in questa sezione. Verranno crittografate localmente 
              nel tuo browser per un uso sicuro, ed è presente un indicatore in tempo reale per validare l'autenticazione con il server. 
              Senza configurare OpenRouter, non potrai usare i modelli online. Gemini funge da AI Advisor predefinito.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
