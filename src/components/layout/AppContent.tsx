import React from 'react';
import Dashboard from "../Dashboard";
import EnterpriseModelDashboard from "../models/EnterpriseModelDashboard";
import RAGDashboard from "../knowledge/RAGDashboard";
import AgentDashboard from "../agents/AgentDashboard";
import WorkflowDashboard from "../workflows/WorkflowDashboard";
import SecurityDashboard from "../security/SecurityDashboard";
import PluginDashboard from "../plugins/PluginDashboard";
import SystemDashboard from "../monitoring/SystemDashboard";
import IntelligenceEngine from "../IntelligenceEngine";
import EnterpriseBenchmarkDashboard from "../benchmark/EnterpriseBenchmarkDashboard";
import AIAssistant from "../AIAssistant";
import ProfessionalChat from "../ProfessionalChat";
import Scheduler from "../Scheduler";
import PluginCenter from "../PluginCenter";
import SecurityCenter from "../SecurityCenter";
import ProjectAnalyzer from "../ProjectAnalyzer";
import AIEvolutionEngine from "../AIEvolutionEngine";
import UserGuide from "../UserGuide";
import FileManager from "../FileManager";
import MediaLab from "../MediaLab";

export function AppContent(props: any) {
  const { activeTab, securitySubTab, setSecuritySubTab, pluginSubTab, setPluginSubTab, ...rest } = props;

  return (
    <main className="flex-1 bg-appbg p-6 overflow-y-auto" id="central-view-viewport">
      {activeTab === "dashboard" && (
        <Dashboard
          currentHardware={rest.currentHardware}
          selectedProfileId={rest.selectedProfileId}
          onProfileChange={rest.handleProfileChange}
          installedModelsCount={rest.models.filter((m: any) => m.downloaded).length}
        />
      )}

      {activeTab === "guide" && <UserGuide />}
      {activeTab === "filemanager" && <FileManager entries={rest.workspaceEntries} setEntries={rest.setWorkspaceEntries} currentPath={rest.workspaceCurrentPath} setCurrentPath={rest.setWorkspaceCurrentPath} />}

      {activeTab === "models" && (
        <EnterpriseModelDashboard models={rest.models} />
      )}
      {activeTab === "rag" && <RAGDashboard />}
      {activeTab === "agents" && <AgentDashboard />}
      {activeTab === "workflows" && <WorkflowDashboard />}
      
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="flex border-b border-zinc-800 space-x-4 bg-zinc-900/40 p-1.5 rounded-lg w-max mb-2">
            <button
              onClick={() => setSecuritySubTab("enterprise")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                securitySubTab === "enterprise" ? "bg-zinc-850 text-rose-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Enterprise Security Platform
            </button>
            <button
              onClick={() => setSecuritySubTab("local")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                securitySubTab === "local" ? "bg-zinc-850 text-emerald-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Local Shield & API Keys
            </button>
          </div>
          {securitySubTab === "enterprise" ? (
            <SecurityDashboard />
          ) : (
            <SecurityCenter
              logs={rest.logs}
              offlineOnly={rest.offlineOnly}
              onToggleOffline={rest.handleToggleOffline}
            />
          )}
        </div>
      )}

      {activeTab === "plugins" && (
        <div className="space-y-4">
          <div className="flex border-b border-zinc-800 space-x-4 bg-zinc-900/40 p-1.5 rounded-lg w-max mb-2">
            <button
              onClick={() => setPluginSubTab("sdk")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                pluginSubTab === "sdk" ? "bg-zinc-850 text-cyan-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Plugin SDK Platform
            </button>
            <button
              onClick={() => setPluginSubTab("catalog")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                pluginSubTab === "catalog" ? "bg-zinc-850 text-zinc-200 font-bold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Marketplace & Local APIs
            </button>
          </div>
          {pluginSubTab === "sdk" ? (
            <PluginDashboard />
          ) : (
            <PluginCenter plugins={rest.plugins} onTogglePlugin={rest.handleTogglePlugin} />
          )}
        </div>
      )}

      {activeTab === "system" && <SystemDashboard />}
      {activeTab === "optimizer" && <IntelligenceEngine />}
      {activeTab === "benchmark" && <EnterpriseBenchmarkDashboard models={rest.models} />}

      {activeTab === "assistant" && (
        <AIAssistant
          availableModels={rest.models}
          selectedProfileId={rest.selectedProfileId}
          currentHardware={rest.currentHardware}
          onDownloadModel={rest.handleDownloadModel}
          onDeleteModel={rest.handleDeleteModel}
        />
      )}
      
      {activeTab === "media" && <MediaLab />}

      {activeTab === "chat" && (
        <ProfessionalChat
          availableModels={rest.models}
          selectedProfileId={rest.selectedProfileId}
          currentHardware={rest.currentHardware}
          onDownloadModel={rest.handleDownloadModel}
          onDeleteModel={rest.handleDeleteModel}
          workspaceEntries={rest.workspaceEntries}
          setWorkspaceEntries={rest.setWorkspaceEntries}
        />
      )}

      {activeTab === "analyzer" && <ProjectAnalyzer />}
      {activeTab === "evolution" && <AIEvolutionEngine />}
      {activeTab === "scheduler" && <Scheduler />}
    </main>
  );
}
