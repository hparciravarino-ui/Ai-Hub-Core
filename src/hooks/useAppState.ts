import { ModelService } from "../core/services/ModelService";
import { useState, useEffect } from 'react';
import { HardwareProfile, Model, Plugin, AuditLog, PerformanceProfileId, FileEntry } from '../types';
import { MODEL_CATALOG, PLUGINS_LIST, SECURITY_LOGS, PERFORMANCE_PROFILES } from '../data';
import { fetchRealHardware } from '../utils';

export function useAppState() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [securitySubTab, setSecuritySubTab] = useState<"enterprise" | "local">("enterprise");
  const [pluginSubTab, setPluginSubTab] = useState<"sdk" | "catalog">("sdk");
  const [workspaceEntries, setWorkspaceEntries] = useState<FileEntry[]>([]);
  const [workspaceCurrentPath, setWorkspaceCurrentPath] = useState<string>('');
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>("custom");
  const [currentHardware, setCurrentHardware] = useState<HardwareProfile>({
    id: "custom",
    name: "Rilevamento in corso...",
    cpu: "Rilevazione automatica CPU...",
    gpu: "Rilevazione automatica GPU...",
    ram: 8,
    vram: 0.5,
    cores: 4,
    threads: 4,
    storageType: "SSD",
    freeSpace: 120,
    temperature: 42,
    loadCpu: 5,
    loadGpu: 0,
    loadRam: 35,
    loadVram: 0,
  });
  const [selectedProfileId, setSelectedProfileId] = useState<PerformanceProfileId>("balanced");
  const [models, setModels] = useState<Model[]>(() => {
    try {
      const saved = localStorage.getItem("ai_hub_models");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse initial models:", e);
    }
    return MODEL_CATALOG;
  });

  useEffect(() => {
    try {
      localStorage.setItem("ai_hub_models", JSON.stringify(models));
    } catch (e) {
      console.error("Failed to save models to localStorage:", e);
    }
  }, [models]);

  const [plugins, setPlugins] = useState<Plugin[]>(PLUGINS_LIST);
  const [logs, setLogs] = useState<AuditLog[]>(SECURITY_LOGS);
  const [offlineOnly, setOfflineOnly] = useState<boolean>(true);
  const [downloadSpeed, setDownloadSpeed] = useState<"standard" | "turbo" | "instant">("turbo");
  const [diagnosticsText, setDiagnosticsText] = useState<string>("");
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);

  const addAuditLog = (type: "Security" | "Inference" | "System" | "Privacy", action: string, status: "Success" | "Blocked" | "Warning" = "Success") => {
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      type,
      action,
      status,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  useEffect(() => {
    const initHardware = async () => {
      try {
        const detectedProfile = await fetchRealHardware();
        if (detectedProfile) {
          setSelectedHardwareId("custom");
          setCurrentHardware(detectedProfile as any);
          addAuditLog("System", `Telemetria: Rilevato hardware reale (${detectedProfile.ram}GB RAM, ${detectedProfile.gpu})`, "Success");
        }
      } catch (e) {
        console.error("Auto-detect failed on mount:", e);
      }
    };
    initHardware();
  }, []);

  const handleProfileChange = (profileId: PerformanceProfileId) => {
    setSelectedProfileId(profileId);
    const profileName = PERFORMANCE_PROFILES.find((p) => p.id === profileId)?.name || profileId;
    addAuditLog("System", `Profilo operativo cambiato in: ${profileName}`, "Success");
  };

  const handleDownloadModel = async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    try {
      addAuditLog("System", `Richiesta di installazione del modello '${model.name}'`, "Success");
      await ModelService.installModel(model);
      setModels((prevModels) =>
        prevModels.map((m) => m.id === modelId ? { ...m, downloaded: true } : m)
      );
      alert(`Modello ${model.name} installato con successo!`);
    } catch (e: any) {
      console.error(e);
      addAuditLog("System", `Errore installazione: ${e.message}`, "Warning");
      alert(`Impossibile installare ${model.name}: ${e.message}`);
    }
  };

  const handleDeleteModel = (modelId: string) => {
    setModels((prevModels) =>
      prevModels.map((m) => {
        if (m.id === modelId) {
          addAuditLog("System", `Modello '${m.name}' rimosso dal disco locale`, "Success");
          return { ...m, downloaded: false, downloadProgress: 0, isDownloading: false };
        }
        return m;
      })
    );
  };

  const handleTogglePlugin = (pluginId: string) => {
    setPlugins((prev) =>
      prev.map((p) => {
        if (p.id === pluginId) {
          const nextState = !p.installed;
          addAuditLog("Security", `Plugin '${p.name}' ${nextState ? "attivata" : "disattivata"} in sandbox locale`, "Success");
          return { ...p, installed: nextState };
        }
        return p;
      })
    );
  };

  const handleToggleOffline = () => {
    const nextState = !offlineOnly;
    setOfflineOnly(nextState);
    addAuditLog(
      "Privacy",
      nextState ? "Connessione internet disattivata (Esecuzione offline al 100%)" : "Abilitata rete ibrida per cataloghi e sync opzionale",
      nextState ? "Success" : "Warning"
    );
  };

  const activeProfile = PERFORMANCE_PROFILES.find((p) => p.id === selectedProfileId) || PERFORMANCE_PROFILES[1];

  return {
    activeTab, setActiveTab,
    securitySubTab, setSecuritySubTab,
    pluginSubTab, setPluginSubTab,
    workspaceEntries, setWorkspaceEntries,
    workspaceCurrentPath, setWorkspaceCurrentPath,
    currentHardware, setCurrentHardware,
    selectedProfileId, setSelectedProfileId,
    models, setModels,
    plugins, setPlugins,
    logs, setLogs,
    offlineOnly, setOfflineOnly,
    handleProfileChange,
    handleDownloadModel,
    handleDeleteModel,
    handleTogglePlugin,
    handleToggleOffline,
    activeProfile,
    downloadSpeed, setDownloadSpeed,
    diagnosticsText, setDiagnosticsText,
    isDiagnosing, setIsDiagnosing
  };
}
