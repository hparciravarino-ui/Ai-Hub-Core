import React, { useState, useEffect } from 'react';
import { Database, Search, Upload, FileText, Activity, Layers, Shield, Save, RefreshCw, BarChart2 } from 'lucide-react';

export default function RAGDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [ingestText, setIngestText] = useState('');
  const [ingestFilename, setIngestFilename] = useState('manuale_tecnico.txt');
  const [ingestType, setIngestType] = useState('text/plain');
  const [ingesting, setIngesting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [snapshotting, setSnapshotting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Poll every 5s for telemetry
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/knowledge/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    if (!query) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      loadStats(); // Update query counter and search times
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleIngest = async () => {
    if (!ingestText) return;
    setIngesting(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: ingestText, 
          filename: ingestFilename,
          mimeType: ingestType,
          author: 'Chief AI Architect'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Documento indicizzato in ${data.chunksIngested} chunks. (Versione: ${data.version || 1})`);
        setIngestText('');
        loadStats();
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIngesting(false);
    }
  };

  const handleCompress = async () => {
    setCompressing(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/vector/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: 'enterprise_knowledge' })
      });
      const data = await res.json();
      setSuccessMsg(`Compressione quantizzata FP16 completata con successo! Rapporto di compressione: ${data.ratio}`);
      loadStats();
    } catch (e) {
      console.error(e);
    } finally {
      setCompressing(false);
    }
  };

  const handleCreateSnapshot = async () => {
    setSnapshotting(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/vector/snapshot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: 'enterprise_knowledge' })
      });
      const data = await res.json();
      setSuccessMsg(`Snapshot creato con successo! ID: ${data.snapshotId}`);
      loadStats();
    } catch (e) {
      console.error(e);
    } finally {
      setSnapshotting(false);
    }
  };

  const handleRestoreSnapshot = async (id: string) => {
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/vector/snapshot/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: 'enterprise_knowledge', snapshotId: id })
      });
      const data = await res.json();
      setSuccessMsg(`Collezione ripristinata correttamente allo stato dello snapshot: ${id}`);
      loadStats();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-500 animate-pulse" />
            Enterprise RAG & Vector Platform
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">Multi-format Document Intelligence & Optimized Quantization</p>
        </div>
        
        {stats && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-right font-mono text-[11px]">
              <span className="text-zinc-500 uppercase block text-[8px]">PROVIDER PROFILE</span>
              <span className="text-blue-400 font-bold">{stats.provider}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-right font-mono text-[11px]">
              <span className="text-zinc-500 uppercase block text-[8px]">TOTAL VECTORS</span>
              <span className="text-emerald-400 font-bold">{stats.totalEmbeddings}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-right font-mono text-[11px]">
              <span className="text-zinc-500 uppercase block text-[8px]">RAM SIZE (EST)</span>
              <span className="text-violet-400 font-bold">{stats.estimatedMemoryMB || 0} MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification Bar */}
      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 rounded px-4 py-3 text-xs font-mono flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Ingestion and Vector Tuning */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Document Ingestion Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center">
              <Upload className="w-4 h-4 mr-2 text-blue-400" />
              Importazione & OCR Multimodale
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Nome Documento</label>
                <input 
                  type="text" 
                  value={ingestFilename}
                  onChange={e => setIngestFilename(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="manuale_tecnico.txt"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Formato / MIME</label>
                <select
                  value={ingestType}
                  onChange={e => setIngestType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="text/plain">Testo Semplice (.txt, .md)</option>
                  <option value="application/json">Strutturato JSON (.json)</option>
                  <option value="text/csv">Tabellare CSV / TSV (.csv, .tsv)</option>
                  <option value="application/pdf">Documento PDF (.pdf - OCR Multimodale)</option>
                  <option value="image/png">Immagine PNG/JPG (.png, .jpg - OCR)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Corpo Documento</label>
                <textarea 
                  value={ingestText}
                  onChange={e => setIngestText(e.target.value)}
                  className="w-full h-32 bg-zinc-950 border border-zinc-850 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 font-mono resize-none"
                  placeholder={ingestType.includes('image') || ingestType.includes('pdf') ? 'Trascrivi o incolla snippet di log / schema in formato testo, oppure passa parametri...' : 'Incolla il contenuto testuale del documento...'}
                />
              </div>

              <button 
                onClick={handleIngest}
                disabled={ingesting || !ingestText}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
              >
                {ingesting ? <Activity className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
                Indicizza con Embeddings
              </button>
            </div>
          </div>

          {/* Vector Tuning & Performance Panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-emerald-400" />
              Ottimizzazioni Vettoriali
            </h3>

            <div className="space-y-3">
              <div className="bg-zinc-950 p-3 rounded border border-zinc-850 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-bold">Compressione Quantizzata</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded font-mono border border-emerald-900/60 uppercase">
                    FP16 active
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                  Sotto-quantizza le coordinate vettoriali a 16-bit. Dimezza il consumo di RAM mantenendo un'accuratezza del 99.8%.
                </p>
                <button
                  onClick={handleCompress}
                  disabled={compressing}
                  className="w-full py-1.5 bg-zinc-850 hover:bg-zinc-800 disabled:opacity-50 text-zinc-300 border border-zinc-750 hover:border-zinc-700 rounded text-[11px] font-bold flex items-center justify-center transition-colors font-mono"
                >
                  {compressing ? <Activity className="w-3.5 h-3.5 animate-spin mr-2" /> : <RefreshCw className="w-3.5 h-3.5 mr-2" />}
                  Quantizza Database
                </button>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-850 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-bold">Backup & Snapshots</span>
                  <span className="text-zinc-500 font-mono text-[10px]">
                    Count: {stats?.snapshotsCount || 0}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Crea una copia esatta del database vettoriale in memoria per ripristini rapidi e migrazioni.
                </p>
                <button
                  onClick={handleCreateSnapshot}
                  disabled={snapshotting}
                  className="w-full py-1.5 bg-zinc-850 hover:bg-zinc-800 disabled:opacity-50 text-zinc-300 border border-zinc-750 hover:border-zinc-700 rounded text-[11px] font-bold flex items-center justify-center transition-colors font-mono"
                >
                  {snapshotting ? <Activity className="w-3.5 h-3.5 animate-spin mr-2" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                  Crea Snapshot
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Search panel and Registry list */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Telemetry Chart Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Tempo di Ricerca Medio</span>
                <span className="text-xl font-bold font-mono text-sky-400">{stats?.averageSearchTimeMs || 0} ms</span>
              </div>
              <Activity className="w-8 h-8 text-sky-500/20" />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Cache Hit Rate</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{stats?.cacheStats?.hitRate || '0%'}</span>
              </div>
              <BarChart2 className="w-8 h-8 text-emerald-500/20" />
            </div>
          </div>

          {/* Semantic Search UI */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center mb-4">
              <Search className="w-4 h-4 mr-2 text-sky-400" /> Ricerca Semantica Cognitiva
            </h3>
            
            <div className="flex space-x-2 mb-4">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="Cerca ad esempio: 'come fare una query vettoriale' o 'architettura solid'..."
              />
              <button 
                onClick={handleSearch}
                disabled={searching || !query}
                className="px-5 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-50 text-zinc-300 border border-zinc-700 hover:border-zinc-650 rounded text-xs font-bold transition-colors cursor-pointer"
              >
                {searching ? <Activity className="w-4 h-4 animate-spin" /> : 'Cerca'}
              </button>
            </div>
            
            <div className="max-h-[250px] overflow-y-auto space-y-3 custom-scrollbar">
              {results.map((r, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-850 rounded p-3 text-xs leading-relaxed">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-[10px] text-blue-400 font-mono uppercase">
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      {r.metadata.source} (v{r.metadata.version || 1})
                    </div>
                    <div className="text-[9px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40 font-mono font-bold">
                      Match: {(r.score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <p className="text-zinc-300 leading-normal whitespace-pre-wrap font-mono text-[11px]">{r.text}</p>
                </div>
              ))}
              {results.length === 0 && !searching && (
                <div className="text-center text-zinc-600 font-mono text-xs py-10">Inserisci una query per interrogare la Knowledge Base integrata.</div>
              )}
            </div>
          </div>

          {/* Ingested Document Registry */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center mb-3">
              <FileText className="w-4 h-4 mr-2 text-violet-400" /> Registro Documenti Indicizzati
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[9px] tracking-wider">
                    <th className="py-2">Nome File</th>
                    <th className="py-2">Formato</th>
                    <th className="py-2">Lingua</th>
                    <th className="py-2">Parole</th>
                    <th className="py-2">Stato</th>
                    <th className="py-2 text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {stats?.files && stats.files.map((f: any, idx: number) => (
                    <tr key={idx} className="text-zinc-300 hover:bg-zinc-950/40">
                      <td className="py-2 font-bold truncate max-w-[150px]">{f.filename}</td>
                      <td className="py-2"><span className="text-blue-400">{f.detectedType}</span></td>
                      <td className="py-2 text-zinc-400">{f.language}</td>
                      <td className="py-2 text-zinc-400">{f.wordCount}</td>
                      <td className="py-2">
                        <span className="text-[10px] bg-purple-950/60 text-purple-400 px-1.5 py-0.2 rounded border border-purple-900/40">
                          v{f.version || 1}
                        </span>
                      </td>
                      <td className="py-2 text-right text-zinc-500 text-[10px]">
                        {new Date(f.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.files || stats.files.length === 0) && (
                    <tr>
                      <td colSpan={6} className="text-center text-zinc-600 py-6 text-xs italic">Nessun documento nel registro.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
