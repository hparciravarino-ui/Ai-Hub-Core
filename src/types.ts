export interface HardwareProfile {
  id: string;
  name: string;
  cpu: string;
  gpu: string;
  ram: number; // GB
  vram: number; // GB
  cores: number;
  threads: number;
  storageType: "SSD" | "HDD" | string;
  freeSpace: number; // GB
  temperature: number; // C
  loadCpu: number; // %
  loadGpu: number; // %
  loadRam: number; // %
  loadVram: number; // %
  runtimes?: Record<string, string | null>;
  aiHardware?: string[];
  raw?: any;
}

export interface FileEntry {
  name: string;
  kind: 'file' | 'directory';
  handle: any;
  size?: number;
  path: string;
}

export type PerformanceProfileId = "eco" | "balanced" | "performance" | "turbo" | "quality";

export interface PerformanceProfile {
  id: PerformanceProfileId;
  name: string;
  description: string;
  cpuThreadsMultiplier: number; // e.g. 0.5 for eco, 1.0 for turbo
  batchSize: number;
  contextWindow: number;
  gpuOffloadRatio: number; // %
  cachingLevel: "Low" | "Medium" | "High" | "Aggressive";
  ramSwapEnabled: boolean;
  modelStreaming: boolean;
  powerLimit: string;
}

export interface Model {
  type?: string;
  tags?: string[];
  sizeBytes?: number;
  id: string;
  name: string;
  category: "Chat" | "Coding" | "Writing" | "Vision" | "OCR" | "Audio" | "Embedding" | "Reasoning" | "ImageGen";
  size: string; // e.g., "1.8 GB"
  quant: string; // e.g., "Q4_K_M"
  ramRequired: number; // GB
  vramRequired: number; // GB
  estimatedSpeed: number; // token/sec
  description: string;
  downloaded: boolean;
  downloadProgress: number; // %
  isDownloading: boolean;
  rating: number;
  format: "GGUF" | "ONNX" | "MLX" | "OpenVINO" | "TensorRT";
  digitalSignature: string;
  sha256: string;
  version: string;
}

export interface TaskItem {
  id: string;
  name: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  status: "queued" | "running" | "completed" | "paused";
  progress: number;
  type: "Inference" | "Task" | "Batch" | "Download";
  timestamp: string;
  latency: number; // ms
  tokenPerSec?: number;
}

export interface Plugin {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  category: "Workflow" | "Storage" | "RAG" | "UIs" | "Integration";
  installed: boolean;
  rating: number;
  signed: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: "Security" | "Inference" | "System" | "Privacy";
  action: string;
  status: "Success" | "Blocked" | "Warning";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isDiagnostic?: boolean;
}
