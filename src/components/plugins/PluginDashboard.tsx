import React, { useState, useEffect } from 'react';
import { 
  Puzzle, CheckCircle, XCircle, Settings, Download, ShieldAlert, 
  RotateCcw, ShieldCheck, Cpu, Database, RefreshCw, Layers 
} from 'lucide-react';

export default function PluginDashboard() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace' | 'developer'>('installed');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Install custom plugin simulation state
  const [newPluginName, setNewPluginName] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);

  const fetchPlugins = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/enterprise/plugins/list');
      if (res.ok) {
        const data = await res.json();
        setPlugins(data);
      }
    } catch (e) {
      console.error("Failed to fetch plugins:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleTogglePlugin = async (id: string) => {
    try {
      const res = await fetch('/api/enterprise/plugins/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        setPlugins(data.plugins);
      }
    } catch (e) {
      console.error("Failed to toggle plugin status:", e);
    }
  };

  const handleRollbackPlugin = async (id: string) => {
    try {
      const res = await fetch('/api/enterprise/plugins/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        alert("Eseguito rollback automatico con successo alla versione precedente registrata negli archivi!");
        fetchPlugins();
      } else {
        const err = await res.json();
        alert(`Impossibile eseguire il rollback: ${err.error || 'Nessuna versione precedente in archivio.'}`);
      }
    } catch (e) {
      console.error("Rollback failed:", e);
    }
  };

  const handleInstallPluginMock = async () => {
    if (!newPluginName.trim()) return;
    setIsInstalling(true);
    const mockManifest = {
      id: `com.community.${newPluginName.toLowerCase().replace(/\s+/g, '')}`,
      name: newPluginName,
      version: '1.0.0',
      author: 'Comunità Indipendente',
      license: 'MIT' as const,
      description: `Estensione utile: ${newPluginName} per flussi cognitivi avanzati degli agenti autonomi.`,
      permissions: ['filesystem.read', 'network.http'],
      dependencies: {},
      signature: 'sig_aihub_enterprise_community_trusted',
      checksum: 'sha256_mock_installed_at_runtime',
      compatibility: { minCoreVersion: '2.0.0', os: ['windows' as const, 'macos' as const, 'linux' as const] }
    };

    try {
      const res = await fetch('/api/enterprise/plugins/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manifest: mockManifest })
      });
      if (res.ok) {
        setNewPluginName('');
        fetchPlugins();
      }
    } catch (e) {
      console.error("Failed to install mock plugin:", e);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar text-zinc-100" id="plugin-sdk-dashboard">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center">
            <Puzzle className="w-5 h-5 mr-2 text-cyan-500" />
            Plugin SDK Platform
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">MODULE 2: Digital Signatures, Sandbox Containerization & Rollbacks</p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchPlugins}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 text-zinc-400 flex items-center transition-all text-xs font-mono font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            REFRESH PLUGINS
          </button>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-zinc-800 pb-px">
        {[
          { id: 'installed', name: 'Plugin Attivi & Caricati' },
          { id: 'marketplace', name: 'Enterprise Marketplace (Catalog)' },
          { id: 'developer', name: 'SDK Developer Tools' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-2 px-1 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 ${
              activeTab === t.id 
                ? 'text-cyan-400 border-cyan-500' 
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {activeTab === 'installed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plugins.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-zinc-600 font-mono text-xs">
              Nessun plugin caricato nel sistema.
            </div>
          ) : (
            plugins.map(p => {
              const isActive = p.status === 'active';
              return (
                <div key={p.manifest.id} className="bg-zinc-900 border border-zinc-800/80 rounded-lg p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200 flex items-center">
                          <Layers className="w-4 h-4 mr-1.5 text-cyan-400" />
                          {p.manifest.name}
                        </h3>
                        <div className="text-[9px] text-zinc-500 font-mono mt-0.5">ID: {p.manifest.id}</div>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] rounded font-bold font-mono border ${
                        isActive 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' 
                          : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-zinc-400 mt-2 mb-4 leading-relaxed">
                      {p.manifest.description}
                    </p>
                    
                    <div className="mb-4 space-y-2">
                      <div className="text-[9px] font-mono text-zinc-500 uppercase flex items-center">
                        <ShieldAlert className="w-3 h-3 mr-1 text-cyan-500" /> Permessi Runtime Accoridati
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.manifest.permissions.map((perm: string) => (
                          <span key={perm} className="bg-zinc-950 px-2 py-0.5 rounded text-[9px] font-mono text-cyan-400 border border-zinc-850">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-2.5 rounded border border-zinc-850/60 font-mono text-[9px] text-zinc-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Firma:</span>
                        <span className="text-cyan-500 font-semibold flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-1" /> {p.manifest.signature}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Checksum SHA256:</span>
                        <span className="truncate max-w-[200px]" title={p.manifest.checksum}>{p.manifest.checksum}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OS Supportati:</span>
                        <span className="text-zinc-400 font-bold uppercase">{p.manifest.compatibility.os.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800/80">
                    <div className="text-[10px] font-mono text-zinc-500">
                      v{p.manifest.version} • {p.manifest.author}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleRollbackPlugin(p.manifest.id)}
                        className="p-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 rounded border border-zinc-800 transition-colors"
                        title="Rollback a versione precedente"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-zinc-400 hover:text-cyan-400" />
                      </button>
                      <button
                        onClick={() => handleTogglePlugin(p.manifest.id)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-rose-950/30 text-rose-400 border border-rose-900/40 hover:bg-rose-950/60' 
                            : 'bg-cyan-950/30 text-cyan-400 border border-cyan-900/40 hover:bg-cyan-950/60'
                        }`}
                      >
                        {isActive ? 'Disabilita' : 'Abilita'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center space-y-4">
          <Download className="w-12 h-12 text-cyan-500 mx-auto animate-bounce" />
          <h3 className="text-md font-bold text-zinc-200">Catalog Marketplace Enterprise</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Integrazione certificata con il registro centrale AI Hub Enterprise. Puoi estendere le capacità del tuo host installando agenti, parser di codice o canali di notifica Slack/Teams con un solo clic.
          </p>
          <div className="max-w-md mx-auto pt-4">
            <div className="p-4 bg-zinc-950 rounded border border-zinc-800 text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400">Slack & Teams Cognitive Broadcaster</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.2 rounded font-mono font-bold">DISPONIBILE</span>
              </div>
              <p className="text-[11px] text-zinc-400">Invia alert del workflow direttamente a Slack con formattazione markdown ricca.</p>
              <button 
                onClick={() => {
                  setNewPluginName('Slack Broadcaster Pro');
                  alert("Premi 'Installa' in fondo per simulare l'importazione di Slack Broadcaster.");
                }}
                className="w-full text-center py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] font-bold text-zinc-300"
              >
                CONFIGURA PER INSTALLAZIONE
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'developer' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h3 className="text-sm font-bold text-zinc-200 mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-2 text-cyan-500" /> SDK Developer Sandbox - Installa Plugin Sperimentali
          </h3>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            I compilatori Tauri/Electron possono scrivere moduli locali e caricarli qui al volo. Il sistema valida automaticamente l'integrità del checksum prima di agganciare il runtime all'EventBus del nucleo cognitivo.
          </p>

          <div className="max-w-md space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Nome del Plugin:</label>
              <input 
                type="text" 
                placeholder="Esempio: SQL Analyzer Module" 
                value={newPluginName}
                onChange={(e) => setNewPluginName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleInstallPluginMock}
              disabled={isInstalling || !newPluginName.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 rounded text-xs font-bold text-white transition-all flex items-center"
            >
              {isInstalling ? 'Installazione...' : 'INSTALLA ED ATTIVA PLUGIN SDK'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
