import { PlatformMemory } from "../core/memory/PlatformMemory";
import { RAGService } from "../core/knowledge/RAGService";
import { AgentManager } from "../core/agents/AgentManager";
import { PluginSDKEngine } from "../core/plugins/PluginSDK";
import { EnterpriseDesktopBridge } from "../core/desktop/EnterpriseDesktopBridge";
import { TelemetryManager } from "../core/monitoring/TelemetryManager";
import { EnterpriseModelManager } from "../core/models/EnterpriseModelManager";

import { bootstrapDI } from "../core/di/bootstrap";

export async function setupServer() {
  bootstrapDI();
  // Initialize System-wide Databases & Core memory partitions
  PlatformMemory.initialize();
  await RAGService.initialize();
  AgentManager.initializeDefaultAgents();
  
  // Initialize Enterprise Modules
  PluginSDKEngine.initialize();
  EnterpriseDesktopBridge.initialize('windows');
  TelemetryManager.startMonitoring();

  // Mock loading catalog from somewhere
  const mockCatalog = [
    { id: "llama-3-8b", name: "Llama 3 8B", version: "1.0", type: "local", tags: ["Chat", "Reasoning"] },
    { id: "llava-1.5", name: "LLaVA 1.5", version: "1.0", type: "local", tags: ["Multimodal", "Vision"] }
  ];
  EnterpriseModelManager.initialize(mockCatalog);
}
