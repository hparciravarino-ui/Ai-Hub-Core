import React, { useState, useEffect } from 'react';
import { 
  Activity, Cpu, HardDrive, MonitorSmartphone, Server, Zap, RefreshCw, 
  Terminal, AlertTriangle, ShieldCheck, Play, HelpCircle, Laptop, 
  CheckCircle, Plus, Eye, Key, FolderArchive, RotateCcw, Package, Download
} from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Card, CardContent } from '../ui/Card';

export default function SystemDashboard() {
  const [subTab, setSubTab] = useState<'telemetry' | 'desktop' | 'qa' | 'packaging'>('telemetry');
  
  // 1. Telemetry State
  const [metrics, setMetrics] = useState<any[]>([]);
  const [liveMetric, setLiveMetric] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // 2. Desktop State
  const [platform, setPlatform] = useState<string>('windows');
  const [services, setServices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [shortcuts, setShortcuts] = useState<any>({});
  const [updater, setUpdater] = useState<any>({ currentVersion: '2.0.0-enterprise', availableVersion: null, status: 'idle', downloadProgress: 0 });
  
  // Shortcut insertion inputs
  const [newShortcutKey, setNewShortcutKey] = useState('');
  const [newShortcutAction, setNewShortcutAction] = useState('');

  // 3. QA State
  const [qaReport, setQaReport] = useState<any>(null);
  const [qaTestCases, setQaTestCases] = useState<any[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [qaSuiteFilter, setQaSuiteFilter] = useState<string>('all');

  // 4. Packaging State
  const [targets, setTargets] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [compilingTargetId, setCompilingTargetId] = useState<string | null>(null);

  // Fetch telemetry & general info
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/enterprise/telemetry/stats');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || []);
        if (data.metrics && data.metrics.length > 0) {
          setLiveMetric(data.metrics[data.metrics.length - 1]);
        }
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error("Telemetry fetch failed:", e);
    }
  };

  // Fetch desktop status
  const fetchDesktopStatus = async () => {
    try {
      const res = await fetch('/api/enterprise/desktop/status');
      if (res.ok) {
        const data = await res.json();
        setPlatform(data.platform);
        setServices(data.services || []);
        setNotifications(data.notifications || []);
        setShortcuts(data.shortcuts || {});
        setUpdater(data.update || {});
      }
    } catch (e) {
      console.error("Desktop status fetch failed:", e);
    }
  };

  // Fetch QA stats
  const fetchQaStats = async () => {
    try {
      const res = await fetch('/api/enterprise/qa/stats');
      if (res.ok) {
        const data = await res.json();
        setQaReport(data.report);
        setQaTestCases(data.testCases || []);
        setVulnerabilities(data.vulnerabilities || []);
      }
    } catch (e) {
      console.error("QA fetch failed:", e);
    }
  };

  // Fetch packaging stats
  const fetchPackagingStats = async () => {
    try {
      const res = await fetch('/api/enterprise/packaging/status');
      if (res.ok) {
        const data = await res.json();
        setTargets(data.targets || []);
        setReleases(data.releases || []);
        setBackups(data.backups || []);
      }
    } catch (e) {
      console.error("Packaging fetch failed:", e);
    }
  };

  // Initial loads and polling loops
  useEffect(() => {
    fetchTelemetry();
    fetchDesktopStatus();
    fetchQaStats();
    fetchPackagingStats();

    const interval = setInterval(() => {
      fetchTelemetry();
      if (subTab === 'desktop') fetchDesktopStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [subTab]);

  // Actions: Diagnostics
  const handleRunDiagnostics = async () => {
    setIsDiagnosing(true);
    setDiagnostics(null);
    try {
      const res = await fetch('/api/enterprise/telemetry/diagnostics');
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
      }
    } catch (e) {
      console.error("Diagnostics failed:", e);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Actions: Switch OS environment
  const handleSwitchOS = async (os: string) => {
    try {
      const res = await fetch('/api/enterprise/desktop/switch-os', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ os })
      });
      if (res.ok) {
        const data = await res.json();
        setPlatform(data.platform);
        fetchDesktopStatus();
      }
    } catch (e) {
      console.error("Switch OS failed:", e);
    }
  };

  // Actions: Toggle Background Service
  const handleToggleService = async (name: string) => {
    try {
      const res = await fetch('/api/enterprise/desktop/toggle-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch (e) {
      console.error("Toggle background service failed:", e);
    }
  };

  // Actions: Register shortcut key
  const handleRegisterShortcut = async () => {
    if (!newShortcutKey || !newShortcutAction) return;
    try {
      const res = await fetch('/api/enterprise/desktop/register-shortcut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotkey: newShortcutKey, action: newShortcutAction })
      });
      if (res.ok) {
        const data = await res.json();
        setShortcuts(data.shortcuts);
        setNewShortcutKey('');
        setNewShortcutAction('');
      }
    } catch (e) {
      console.error("Register shortcut failed:", e);
    }
  };

  // Actions: Check Auto Updates
  const handleCheckUpdates = async () => {
    try {
      const res = await fetch('/api/enterprise/desktop/check-updates', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUpdater(data.status);
        fetchDesktopStatus();
      }
    } catch (e) {
      console.error("Update check failed:", e);
    }
  };

  // Actions: Apply updates
  const handleApplyUpdate = async () => {
    try {
      const res = await fetch('/api/enterprise/desktop/apply-update', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUpdater(data.status);
        alert("Piattaforma aggiornata con successo! Riavvio virtuale dei servizi completato.");
        fetchDesktopStatus();
      }
    } catch (e) {
      console.error("Applying update failed:", e);
    }
  };

  // Actions: Run QA Pipeline
  const handleRunQAPipeline = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/enterprise/qa/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite: qaSuiteFilter === 'all' ? undefined : qaSuiteFilter })
      });
      if (res.ok) {
        const data = await res.json();
        setQaReport(data.report);
        setQaTestCases(data.testCases);
      }
    } catch (e) {
      console.error("QA trigger failed:", e);
    } finally {
      setIsTesting(false);
    }
  };

  // Actions: Compile Targets
  const handleCompileTarget = async (id: string) => {
    setCompilingTargetId(id);
    try {
      const res = await fetch('/api/enterprise/packaging/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        setTargets(data.targets);
      }
    } catch (e) {
      console.error("Compile target failed:", e);
    } finally {
      setCompilingTargetId(null);
    }
  };

  // Actions: Create Backup Configuration dump
  const handleCreateBackup = async () => {
    try {
      const res = await fetch('/api/enterprise/packaging/backup', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups);
        alert(`Backup "${data.backup.id}" generato con successo! Dimensione: ${data.backup.sizeKB}KB.`);
      }
    } catch (e) {
      console.error("Backup creation failed:", e);
    }
  };

  // Actions: Restore configuration
  const handleRestoreBackup = async (id: string) => {
    try {
      const res = await fetch('/api/enterprise/packaging/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        alert(`Ripristino completato con successo dal punto di backup: ${id}`);
        fetchPackagingStats();
      }
    } catch (e) {
      console.error("Restore failed:", e);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar text-zinc-100" id="system-runtime-dashboard">
      
      {/* Upper Title Section */}
      <SectionHeader 
        title="System Observability & DevOps Core" 
        description="MODULES 3-6: Desktop Bridges, Telemetry, QA Pipelines & Compilers"
        icon={<MonitorSmartphone className="w-5 h-5 text-amber-500" />}
        actions={
          <div className="flex space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-850">
            {[
              { id: 'telemetry', name: 'Observability' },
              { id: 'desktop', name: 'Desktop OS' },
              { id: 'qa', name: 'Quality Assurance' },
              { id: 'packaging', name: 'Distribution' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  subTab === tab.id 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        }
      />

      {/* SUB-TAB 1: TELEMETRY & OBSERVABILITY (Modulo 4) */}
      {subTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Main live metric counters */}
          {liveMetric ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[9px] text-zinc-500 font-mono uppercase mb-2 flex items-center justify-between">
                      <span className="flex items-center"><Cpu className="w-3 h-3 mr-1 text-amber-500" /> CPU CORES</span>
                      <span className="text-zinc-400 font-bold">{liveMetric.temperatureC}°C</span>
                    </div>
                    <div className="text-xl font-bold text-zinc-100 mb-1">{liveMetric.cpuUsage.toFixed(1)}%</div>
                  </div>
                  <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${liveMetric.cpuUsage}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[9px] text-zinc-500 font-mono uppercase mb-2 flex items-center justify-between">
                      <span className="flex items-center"><Zap className="w-3 h-3 mr-1 text-purple-400" /> GPU CORE</span>
                      <span className="text-zinc-400 font-bold">{liveMetric.powerDrawWatts}W</span>
                    </div>
                    <div className="text-xl font-bold text-zinc-100 mb-1">{liveMetric.gpuUsage.toFixed(1)}%</div>
                  </div>
                  <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${liveMetric.gpuUsage}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[9px] text-zinc-500 font-mono uppercase mb-2 flex items-center">
                      <HardDrive className="w-3 h-3 mr-1 text-blue-400" /> SYSTEM RAM
                    </div>
                    <div className="text-xl font-bold text-zinc-100 mb-1">
                      {liveMetric.ramUsage.toFixed(1)} <span className="text-xs text-zinc-500">GB</span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${(liveMetric.ramUsage / 32) * 100}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[9px] text-zinc-500 font-mono uppercase mb-2 flex items-center">
                      <Server className="w-3 h-3 mr-1 text-emerald-400" /> GPU VRAM
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                      {liveMetric.vramUsage.toFixed(1)} <span className="text-xs text-zinc-500">GB</span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${(liveMetric.vramUsage / 24) * 100}%` }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 font-mono text-xs">Inizializzazione flussi telemetrici...</div>
          )}

          {/* Alert Logs & Tracing charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Live Chart (CPU / GPU load profiling) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center justify-between">
                <span className="flex items-center"><Activity className="w-4 h-4 mr-2 text-amber-500" /> Live Workload Profiling Histograms</span>
                <span className="text-[9px] font-mono text-zinc-500">3s updates</span>
              </h3>
              
              <div className="h-32 flex items-end space-x-1.5 bg-zinc-950/60 p-4 rounded border border-zinc-850">
                {metrics.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full gap-px">
                    {/* GPU Bar */}
                    <div className="w-full bg-purple-500/60 rounded-t" style={{ height: `${m.gpuUsage * 0.5}%` }} title={`GPU: ${m.gpuUsage.toFixed(1)}%`} />
                    {/* CPU Bar */}
                    <div className="w-full bg-amber-500/60 rounded-t" style={{ height: `${m.cpuUsage * 0.5}%` }} title={`CPU: ${m.cpuUsage.toFixed(1)}%`} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-2 px-1">
                <span>-60s fa</span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500/60 mr-1"></span> CPU Load</span>
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500/60 mr-1"></span> GPU Load</span>
                </span>
                <span>Adesso</span>
              </div>
            </div>

            {/* Active Telemetry Alerts logger */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-rose-500 animate-pulse" /> Live Telemetry Alert Loggers
              </h3>
              
              <div className="space-y-2 h-[140px] overflow-y-auto custom-scrollbar pr-1">
                {alerts.length === 0 ? (
                  <div className="text-center text-zinc-600 font-mono text-xs py-10">
                    Nessuna violazione energetica o termica registrata.
                  </div>
                ) : (
                  alerts.map(a => (
                    <div key={a.id} className="bg-zinc-950 p-2.5 rounded border border-zinc-850 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${a.level === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <span className="text-zinc-500">[{new Date(a.timestamp).toLocaleTimeString()}]</span>
                        <span className="text-zinc-300">{a.message}</span>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 rounded border uppercase ${
                        a.level === 'critical' ? 'bg-rose-950/40 text-rose-400 border-rose-900/60' : 'bg-amber-950/40 text-amber-400 border-amber-900/60'
                      }`}>
                        {a.level}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Deep System Diagnostic Runner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> Deep Hardware & Sandbox Diagnostics
              </h3>
              <button
                onClick={handleRunDiagnostics}
                disabled={isDiagnosing}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 rounded text-xs font-mono font-bold text-white transition-all flex items-center"
              >
                {isDiagnosing ? 'DIAGNOSING...' : 'RUN FULL DIAGNOSTICS'}
              </button>
            </div>

            {diagnostics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950 p-4 rounded border border-zinc-850 font-mono text-xs">
                {Object.keys(diagnostics.results).map(key => (
                  <div key={key} className="flex justify-between border-b border-zinc-900 pb-1.5">
                    <span className="text-zinc-500 uppercase text-[10px]">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-emerald-400 font-bold">{diagnostics.results[key]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-950/50 p-6 rounded border border-zinc-850 border-dashed text-center text-zinc-500 font-mono text-xs">
                Fai clic su 'RUN FULL DIAGNOSTICS' per scansionare il controller locale ed i socket Docker.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DESKTOP RUNTIME & SERVICES (Modulo 3) */}
      {subTab === 'desktop' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* OS Platform & background processes supervisor */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center">
                <Laptop className="w-4 h-4 mr-2 text-amber-500" /> OS Services Supervisor
              </h3>
              {/* OS Environment selector */}
              <div className="flex space-x-1 bg-zinc-950 p-0.5 rounded border border-zinc-850">
                {['windows', 'macos', 'linux'].map(os => (
                  <button
                    key={os}
                    onClick={() => handleSwitchOS(os)}
                    className={`px-2 py-1 text-[10px] font-mono uppercase rounded transition-all ${
                      platform === os ? 'bg-amber-600 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {os}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Supervisione dei moduli nativi agganciati all'host. Ciascun runtime è isolato e monitorato tramite pid locali.
            </p>

            <div className="space-y-2">
              {services.map(s => (
                <div key={s.name} className="bg-zinc-950 p-3 rounded border border-zinc-850 flex justify-between items-center text-xs font-mono">
                  <div>
                    <div className="font-bold text-zinc-300">{s.name}</div>
                    <div className="text-[9px] text-zinc-500">TYPE: {s.type} • CPU: {s.cpuPercentage}% {s.pid ? `• PID: ${s.pid}` : ''}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${
                      s.status === 'running' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}>
                      {s.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleToggleService(s.name)}
                      className={`px-2.5 py-1 text-[10px] rounded font-bold border transition-colors ${
                        s.status === 'running' 
                          ? 'bg-rose-950/30 text-rose-400 border-rose-900/40 hover:bg-rose-950/60' 
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      {s.status === 'running' ? 'STOP' : 'START'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts & Auto update Engine */}
          <div className="space-y-6">
            
            {/* Auto Update Engine */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 text-amber-500" /> Desktop Update Manager
              </h3>
              
              <div className="bg-zinc-950 p-4 rounded border border-zinc-850/80 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500">Versione Installata:</span>
                  <span className="text-amber-400 font-bold">{updater.currentVersion}</span>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500">Stato Updater:</span>
                  <span className="bg-zinc-900 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300 border border-zinc-800 uppercase">
                    {updater.status}
                  </span>
                </div>

                {updater.availableVersion && (
                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400 font-bold">Aggiornamento Disponibile:</span>
                      <span className="text-emerald-400 font-bold">v{updater.availableVersion}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">{updater.releaseNotes}</p>
                    
                    {updater.status === 'downloading' && (
                      <div className="w-full bg-zinc-950 h-1.5 rounded overflow-hidden mt-1">
                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${updater.downloadProgress}%` }} />
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  {updater.status === 'ready_to_install' ? (
                    <button
                      onClick={handleApplyUpdate}
                      className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all"
                    >
                      APPLY UPDATE & RESTART
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckUpdates}
                      disabled={updater.status === 'checking' || updater.status === 'downloading'}
                      className="w-full text-center py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded text-xs font-bold transition-all"
                    >
                      {updater.status === 'checking' ? 'CHECKING...' : updater.status === 'downloading' ? 'DOWNLOADING MODULES...' : 'CHECK FOR UPDATES'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Keyboard shortcuts mapping */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center">
                <Key className="w-4 h-4 mr-2 text-amber-500" /> Hotkeys Global Keyboards
              </h3>
              
              <div className="space-y-2">
                {Object.keys(shortcuts).map(key => (
                  <div key={key} className="bg-zinc-950 px-3 py-2 rounded border border-zinc-850/80 flex justify-between items-center text-xs font-mono">
                    <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold">{key}</span>
                    <span className="text-zinc-500">{shortcuts[key]}</span>
                  </div>
                ))}

                {/* Add new shortcut */}
                <div className="pt-3 border-t border-zinc-800/80 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ctrl+Alt+G" 
                    value={newShortcutKey}
                    onChange={(e) => setNewShortcutKey(e.target.value)}
                    className="w-1/3 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Avvia RAG Search" 
                    value={newShortcutAction}
                    onChange={(e) => setNewShortcutAction(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                  />
                  <button 
                    onClick={handleRegisterShortcut}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 rounded transition-colors"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: QUALITY ASSURANCE PIPELINE (Modulo 5) */}
      {subTab === 'qa' && (
        <div className="space-y-6">
          {qaReport ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* QA report card metrics */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Static Coverage Percent</div>
                  <div className="text-3xl font-bold text-amber-400">{qaReport.coveragePercent}%</div>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded overflow-hidden mt-3">
                  <div className="bg-amber-500 h-full" style={{ width: `${qaReport.coveragePercent}%` }} />
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Vulnerabilità Rilevate</div>
                  <div className="text-3xl font-bold text-rose-500">{qaReport.vulnCount}</div>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-3">Dependency scan: active</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Static Code Grade</div>
                  <div className="text-3xl font-bold text-emerald-400">{qaReport.staticAnalysisGrade}</div>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-3">Linter rules: verified</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 font-mono text-xs">Caricamento risultati test QA...</div>
          )}

          {/* Test cases list & vulnerability detailed list */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center">
                <Terminal className="w-4 h-4 mr-2 text-amber-500" /> Executive Automated Verification Suites
              </h3>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <select 
                  value={qaSuiteFilter} 
                  onChange={(e) => setQaSuiteFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 rounded text-xs px-2.5 py-1 text-zinc-300 font-mono focus:outline-none"
                >
                  <option value="all">All Suites (10 cases)</option>
                  <option value="unit">Unit Tests</option>
                  <option value="integration">Integration Tests</option>
                  <option value="security">Security Defenses</option>
                  <option value="stress">Stress Tests</option>
                </select>

                <button
                  onClick={handleRunQAPipeline}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 rounded text-xs font-mono font-bold text-white transition-all flex items-center"
                >
                  {isTesting ? 'RUNNING VERIFICATION...' : 'RUN PIPELINE TEST'}
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {qaTestCases
                .filter(t => qaSuiteFilter === 'all' || t.suite === qaSuiteFilter)
                .map(tc => {
                  const isPassed = tc.status === 'passed';
                  const isRunning = tc.status === 'running';
                  return (
                    <div key={tc.id} className="bg-zinc-950 p-3 rounded border border-zinc-850 flex justify-between items-center text-xs font-mono">
                      <div>
                        <div className="font-bold text-zinc-300">{tc.name}</div>
                        <div className="text-[9px] text-zinc-500 uppercase">SUITE: {tc.suite} • TIME: {tc.durationMs}ms</div>
                        {tc.errorMessage && <div className="text-[9px] text-rose-400 mt-1">{tc.errorMessage}</div>}
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                        isPassed 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' 
                          : isRunning 
                            ? 'bg-amber-950/40 text-amber-400 border-amber-900/60 animate-pulse' 
                            : 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                      }`}>
                        {tc.status}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PACKAGING & DISTRIBUTION releases (Modulo 6) */}
      {subTab === 'packaging' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Installer compilation packagers */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center">
                <Package className="w-4 h-4 mr-2 text-amber-500" /> Enterprise Release Bundler & Packaging
              </h3>
              
              <div className="space-y-3">
                {targets.map(t => {
                  const isBuilding = compilingTargetId === t.id;
                  const isSigned = t.status === 'signed';
                  return (
                    <div key={t.id} className="bg-zinc-950 p-3 rounded border border-zinc-850/80 flex justify-between items-center text-xs font-mono">
                      <div>
                        <div className="font-bold text-zinc-300">{t.name}</div>
                        <div className="text-[9px] text-zinc-500 uppercase">OS: {t.os} • EXT: {t.extension} {t.sizeMB ? `• SIZE: ${t.sizeMB}MB` : ''}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                          isSigned 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' 
                            : isBuilding 
                              ? 'bg-amber-950/40 text-amber-400 border-amber-900/60 animate-pulse' 
                              : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}>
                          {isBuilding ? 'BUILDING...' : t.status}
                        </span>
                        <button
                          onClick={() => handleCompileTarget(t.id)}
                          disabled={!!compilingTargetId}
                          className="px-2.5 py-1 text-[10px] rounded font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 disabled:opacity-40 transition-colors"
                        >
                          BUILD
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Backups panel & System Restore configurations */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-200 mb-2 flex items-center">
                  <FolderArchive className="w-4 h-4 mr-2 text-amber-500" /> Configuration Profile & Backups
                </h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Migra la configurazione o ripristina la memoria dell'applicazione importando ed esportando snapshot binari protetti.
                </p>

                <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1 mb-4">
                  {backups.map(b => (
                    <div key={b.id} className="bg-zinc-950 p-2.5 rounded border border-zinc-850 flex justify-between items-center text-xs font-mono">
                      <div>
                        <div className="font-bold text-zinc-300">{b.id}</div>
                        <div className="text-[9px] text-zinc-500 uppercase">TIME: {new Date(b.timestamp).toLocaleTimeString()} • SIZE: {b.sizeKB}KB • TYPE: {b.type}</div>
                      </div>
                      <button
                        onClick={() => handleRestoreBackup(b.id)}
                        className="text-[10px] bg-amber-950/30 text-amber-400 hover:bg-amber-950/60 border border-amber-900/60 px-2.5 py-1 rounded transition-colors font-bold"
                      >
                        RESTORE
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleCreateBackup}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 rounded transition-all flex items-center justify-center font-mono uppercase"
              >
                <Plus className="w-3.5 h-3.5 mr-2" /> GENERATE BACKUP SNAPSHOT NOW
              </button>
            </div>
          </div>

          {/* Release logs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center">
              <Package className="w-4 h-4 mr-2 text-amber-500" /> Enterprise Deployed Distribution Records
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {releases.map(r => (
                <div key={r.version} className="bg-zinc-950 p-3 rounded border border-zinc-850/80 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                    <span className="text-amber-400">v{r.version}</span>
                    <span className="text-zinc-500 font-normal">{r.date}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{r.notes}</p>
                  <div className="text-[10px] text-zinc-600 font-bold">RELEASED BY: {r.deployedBy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
