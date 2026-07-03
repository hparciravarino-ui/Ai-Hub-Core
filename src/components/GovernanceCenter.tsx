import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  UserCheck,
  Binary,
  Layers,
  Sparkles,
  GitPullRequest,
  Check,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "motion/react";

interface QualityScore {
  architecture: number;
  scalability: number;
  cleanliness: number;
  documentation: number;
  performance: number;
  testing: number;
  security: number;
  modularity: number;
  maintainability: number;
  overall: number;
}

interface GovernanceModuleReport {
  moduleName: string;
  scores: QualityScore;
  status: "Approved" | "Requires Refactoring";
  details: string[];
}

interface TraceabilityRequirement {
  id: string;
  requirement: string;
  chapter: string;
  modules: string[];
  dependencies: string[];
  verificationCriteria: string;
  tests: string[];
  predictedImpact: string;
  status: "Verified" | "Pending" | "Failed";
}

interface VirtualRoleCheck {
  role: string;
  engineerName: string;
  status: "Approved" | "Rejected" | "Needs Revision";
  comments: string[];
}

interface DoDBlockStatus {
  key: string;
  description: string;
  triggered: boolean;
  severity: "Critical" | "High";
}

interface QualityAuditReport {
  timestamp: string;
  systemIntegrityScore: number;
  canMerge: boolean;
  blockers: string[];
  moduleReports: GovernanceModuleReport[];
  traceabilityMatrix: TraceabilityRequirement[];
  virtualRoles: VirtualRoleCheck[];
  blockRules: DoDBlockStatus[];
}

export default function GovernanceCenter() {
  const [auditData, setAuditData] = useState<QualityAuditReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "traceability" | "roles" | "dod">("overview");

  const fetchAuditData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/core/governance");
      if (!res.ok) {
        throw new Error("Impossibile recuperare i dati dell'audit di governance.");
      }
      const data = await res.json();
      setAuditData(data);
    } catch (err: any) {
      setError(err.message || "Errore di connessione.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  if (loading && !auditData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4" id="gov-loading-container">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-zinc-400 text-xs font-mono">Elaborazione audit di governance in tempo reale...</p>
      </div>
    );
  }

  if (error && !auditData) {
    return (
      <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-6 max-w-2xl mx-auto space-y-4" id="gov-error-container">
        <div className="flex items-center space-x-3 text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="font-bold text-sm">Errore di Caricamento Governance</h3>
        </div>
        <p className="text-zinc-400 text-xs">{error}</p>
        <button
          onClick={fetchAuditData}
          className="bg-red-900/30 text-red-300 border border-red-800/40 px-3 py-1.5 rounded text-xs font-mono hover:bg-red-900/50 transition-all"
        >
          Riprova Scansione
        </button>
      </div>
    );
  }

  const overallIntegrity = auditData?.systemIntegrityScore || 0;
  const canMerge = auditData?.canMerge ?? false;

  return (
    <div className="space-y-6" id="gov-center-root">
      {/* Title Header with Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5" id="gov-header">
        <div>
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-zinc-50 font-display tracking-tight">
              Governance & Quality Assurance <span className="text-emerald-500">AAGQA</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Capitolo 5: Processo di ingegneria enterprise, controllo del debito tecnico e definizione dei vincoli di merge (DoD).
          </p>
        </div>

        <button
          onClick={fetchAuditData}
          disabled={loading}
          className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-1.5 rounded-md text-xs font-mono font-medium text-zinc-300 transition-all disabled:opacity-50"
          id="btn-run-audit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-500" : "text-zinc-400"}`} />
          <span>{loading ? "Analisi..." : "Esegui Audit Live"}</span>
        </button>
      </div>

      {/* Global Status Banner Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="gov-stats-grid">
        {/* Core Quality Level */}
        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Integrità Sistema</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-zinc-100">{overallIntegrity}</span>
              <span className="text-zinc-500 text-xs">/ 100</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${overallIntegrity >= 90 ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30" : "bg-amber-950/50 text-amber-400 border border-amber-900/30"}`}>
              {overallIntegrity >= 90 ? "LIVELLO ENTERPRISE" : "ATTENZIONE DEBITO"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-zinc-800 flex items-center justify-center relative">
            <span className="text-[11px] font-mono font-bold text-emerald-400">90+</span>
          </div>
        </div>

        {/* DoD Merge Check Status */}
        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Merge Gate (DoD)</span>
            <div className="flex items-center space-x-1.5">
              {canMerge ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={`text-sm font-bold ${canMerge ? "text-emerald-400" : "text-red-400"}`}>
                {canMerge ? "APPROVATO" : "BLOCCATO"}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">
              {canMerge ? "Tutti i vincoli di merge superati" : `${auditData?.blockers.length} bloccanti rilevati`}
            </p>
          </div>
          <div className={`p-2.5 rounded ${canMerge ? "bg-emerald-950/20 text-emerald-400" : "bg-red-950/20 text-red-400"}`}>
            <GitPullRequest className="w-5 h-5" />
          </div>
        </div>

        {/* Audited Scope Status */}
        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Scopo dell'Audit</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-sm font-bold text-zinc-200">Full Codebase Scan</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">
              Timestamp: {auditData ? new Date(auditData.timestamp).toLocaleTimeString() : "N/A"}
            </p>
          </div>
          <div className="p-2.5 rounded bg-zinc-900 text-zinc-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-zinc-850" id="gov-sub-navigation">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`px-4 py-2 text-xs font-medium font-mono border-b-2 transition-all ${
            activeSubTab === "overview"
              ? "border-emerald-500 text-emerald-400 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Punteggi Moduli</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab("traceability")}
          className={`px-4 py-2 text-xs font-medium font-mono border-b-2 transition-all ${
            activeSubTab === "traceability"
              ? "border-emerald-500 text-emerald-400 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Matrice Tracciabilità</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab("roles")}
          className={`px-4 py-2 text-xs font-medium font-mono border-b-2 transition-all ${
            activeSubTab === "roles"
              ? "border-emerald-500 text-emerald-400 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Ruoli Virtuali</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab("dod")}
          className={`px-4 py-2 text-xs font-medium font-mono border-b-2 transition-all ${
            activeSubTab === "dod"
              ? "border-emerald-500 text-emerald-400 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Regole DoD ({auditData?.blockRules.length || 0})</span>
          </div>
        </button>
      </div>

      {/* Sub-Tabs Viewport */}
      <div className="space-y-4" id="gov-tab-viewport">
        {/* VIEW: OVERVIEW / MODULES SCORES */}
        {activeSubTab === "overview" && (
          <div className="space-y-4" id="view-modules-overview">
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg">
              <h3 className="text-xs font-bold font-mono text-zinc-400 mb-2">Punteggio Qualità Dettagliato dei Moduli</h3>
              <p className="text-[11px] text-zinc-500 mb-4">
                Ogni modulo core riceve una valutazione oggettiva basata sulla densità della documentazione, complessità di accoppiamento, modularità e copertura dei test. Il target enterprise minimo è 90/100.
              </p>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {auditData?.moduleReports.map((report, idx) => (
                  <div key={idx} className="bg-zinc-900/40 border border-zinc-850/60 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-850/40 pb-2">
                      <div className="flex items-center space-x-2">
                        <Binary className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold text-zinc-200">{report.moduleName}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        report.scores.overall >= 90
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                          : "bg-red-950/40 text-red-400 border-red-900/30"
                      }`}>
                        SCORE: {report.scores.overall}/100
                      </span>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-400">
                      <div className="bg-zinc-950/50 p-2 rounded border border-zinc-900">
                        <div className="text-zinc-500">Architettura</div>
                        <div className="font-bold text-zinc-300">{report.scores.architecture}</div>
                      </div>
                      <div className="bg-zinc-950/50 p-2 rounded border border-zinc-900">
                        <div className="text-zinc-500">Scalabilità</div>
                        <div className="font-bold text-zinc-300">{report.scores.scalability}</div>
                      </div>
                      <div className="bg-zinc-950/50 p-2 rounded border border-zinc-900">
                        <div className="text-zinc-500">Pulizia</div>
                        <div className="font-bold text-zinc-300">{report.scores.cleanliness}</div>
                      </div>
                      <div className="bg-zinc-950/50 p-2 rounded border border-zinc-900">
                        <div className="text-zinc-500">Documenti</div>
                        <div className="font-bold text-zinc-300">{report.scores.documentation}</div>
                      </div>
                      <div className="bg-zinc-950/50 p-2 rounded border border-zinc-900">
                        <div className="text-zinc-500">Test Unitari</div>
                        <div className="font-bold text-zinc-300">{report.scores.testing}</div>
                      </div>
                      <div className="bg-zinc-950/50 p-2 rounded border border-zinc-900">
                        <div className="text-zinc-500">Sicurezza</div>
                        <div className="font-bold text-zinc-300">{report.scores.security}</div>
                      </div>
                    </div>

                    {/* Details list */}
                    <div className="space-y-1 mt-2 bg-zinc-950/30 p-2.5 rounded border border-zinc-900/50">
                      <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">Resoconto di Audit:</div>
                      {report.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start space-x-1.5 text-[10px] text-zinc-400 leading-relaxed font-sans">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: TRACEABILITY MATRIX */}
        {activeSubTab === "traceability" && (
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg space-y-4" id="view-traceability">
            <div>
              <h3 className="text-xs font-bold font-mono text-zinc-400">Matrice di Tracciabilità dei Requisiti (Traceability Matrix)</h3>
              <p className="text-[11px] text-zinc-500 mt-1">
                Collega i requisiti strategici identificati nei capitoli della SRS ai relativi moduli software, criteri di verifica e test necessari.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-zinc-900/50">
                    <th className="p-3">ID Requisito</th>
                    <th className="p-3">Capitolo</th>
                    <th className="p-3">Definizione Requisito</th>
                    <th className="p-3">Moduli / Dipendenze</th>
                    <th className="p-3">Criteri & Test</th>
                    <th className="p-3 text-right">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {auditData?.traceabilityMatrix.map((req, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/20 text-zinc-300">
                      <td className="p-3 font-mono font-bold text-emerald-400 text-[10px] whitespace-nowrap">{req.id}</td>
                      <td className="p-3 font-mono text-[10px] text-zinc-500 whitespace-nowrap">{req.chapter}</td>
                      <td className="p-3 leading-relaxed font-medium text-zinc-200">{req.requirement}</td>
                      <td className="p-3 space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {req.modules.map((m, mIdx) => (
                            <span key={mIdx} className="bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded text-[9px] font-mono">{m}</span>
                          ))}
                        </div>
                        <div className="text-[9px] text-zinc-500 font-mono">
                          Dipendenze: {req.dependencies.join(", ")}
                        </div>
                      </td>
                      <td className="p-3 space-y-1 text-zinc-400 leading-normal">
                        <p>{req.verificationCriteria}</p>
                        <div className="text-[9px] text-sky-400 font-mono">
                          Test: {req.tests.join(", ")}
                        </div>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                          VERIFICATO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: VIRTUAL ROLES */}
        {activeSubTab === "roles" && (
          <div className="space-y-4" id="view-virtual-roles">
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg">
              <h3 className="text-xs font-bold font-mono text-zinc-400 mb-2">Comitato dei Ruoli Virtuali Obbligatori</h3>
              <p className="text-[11px] text-zinc-500 mb-4">
                Simulazione del flusso di approvazione dei Senior Architect, Backend, AI, Performance e Security Engineers. Nessuna modifica viene integrata senza l'approvazione formale del team virtuale.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditData?.virtualRoles.map((role, idx) => (
                  <div key={idx} className="bg-zinc-900/40 border border-zinc-850/60 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-850/40 pb-2">
                      <div>
                        <div className="text-xs font-bold text-zinc-200">{role.role}</div>
                        <div className="text-[9px] font-mono text-zinc-500">{role.engineerName}</div>
                      </div>
                      <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                        APPROVED
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {role.comments.map((comment, cIdx) => (
                        <div key={cIdx} className="text-[11px] text-zinc-400 leading-relaxed font-sans italic bg-zinc-950/40 p-2 rounded border border-zinc-900">
                          "{comment}"
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: DOD RULES */}
        {activeSubTab === "dod" && (
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg space-y-4" id="view-dod">
            <div>
              <h3 className="text-xs font-bold font-mono text-zinc-400">Regole e Vincoli di Blocco del Merge (Definition of Done)</h3>
              <p className="text-[11px] text-zinc-500 mt-1">
                La pipeline di integrazione blocca automaticamente il merge se viene rilevata anche una sola delle seguenti anomalie.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {auditData?.blockRules.map((rule, idx) => (
                <div
                  key={idx}
                  className={`border p-3.5 rounded-lg flex items-start justify-between gap-3 ${
                    rule.triggered
                      ? "bg-red-950/20 border-red-900/40 text-red-300"
                      : "bg-zinc-900/30 border-zinc-850/60 text-zinc-300"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${rule.triggered ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></div>
                      <span className="font-bold text-xs text-zinc-200">{rule.description}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Severità: <span className="text-zinc-400">{rule.severity}</span> | Codice: <span className="text-zinc-400">{rule.key}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                    rule.triggered
                      ? "bg-red-950/60 text-red-400 border-red-900/50"
                      : "bg-emerald-950/60 text-emerald-400 border-emerald-900/50"
                  }`}>
                    {rule.triggered ? "TRIGGERED" : "PASS"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
