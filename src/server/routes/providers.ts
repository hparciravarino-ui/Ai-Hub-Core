import { Router } from "express";

export const providersRouter = Router();

interface ProviderConfig {
  id: string;
  name: string;
  status: "active" | "inactive" | "offline" | "unconfigured" | "error";
  priority: "primary" | "secondary" | "tertiary" | "none";
  encryptedKey: string;
  baseUrl?: string;
  version?: string;
  models: any[];
  latencyMs: number | null;
  quota: string | null;
  lastChecked: string | null;
  usageCount: number;
}

let providersDb: Record<string, ProviderConfig> = {};

// Default provider skeleton
const DEFAULT_PROVIDERS = [
  "google-gemini", "openai", "anthropic", "openrouter", "groq",
  "together-ai", "mistral", "deepseek", "fireworks-ai", "azure-openai", "custom-openai"
];

DEFAULT_PROVIDERS.forEach(id => {
  providersDb[id] = {
    id,
    name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    status: "unconfigured",
    priority: "none",
    encryptedKey: "",
    models: [],
    latencyMs: null,
    quota: null,
    lastChecked: null,
    usageCount: 0
  };
});

// A simple simulated encryption
const simulateEncrypt = (key: string) => Buffer.from(key).toString('base64');
const simulateDecrypt = (encKey: string) => Buffer.from(encKey, 'base64').toString('utf-8');

// Obfuscate key for frontend
const obfuscateKey = (key: string) => {
  if (!key) return "";
  const dec = simulateDecrypt(key);
  if (dec.length <= 8) return "********";
  return dec.substring(0, 4) + "*".repeat(dec.length - 8) + dec.substring(dec.length - 4);
};

providersRouter.get("/", (req, res) => {
  // Return safe version
  const safeList = Object.values(providersDb).map(p => ({
    ...p,
    encryptedKey: obfuscateKey(p.encryptedKey)
  }));
  res.json(safeList);
});

providersRouter.post("/:id", (req, res) => {
  const { id } = req.params;
  const { key, baseUrl, version, priority } = req.body;
  
  if (!providersDb[id]) {
    providersDb[id] = {
      id,
      name: id,
      status: "unconfigured",
      priority: "none",
      encryptedKey: "",
      models: [],
      latencyMs: null,
      quota: null,
      lastChecked: null,
      usageCount: 0
    };
  }

  const p = providersDb[id];
  if (key) {
    p.encryptedKey = simulateEncrypt(key);
  }
  if (baseUrl) p.baseUrl = baseUrl;
  if (version) p.version = version;
  if (priority) p.priority = priority;
  
  p.status = "active";
  p.lastChecked = new Date().toISOString();
  p.latencyMs = Math.floor(Math.random() * 200) + 20; // Simulated latency
  
  // Simulated models
  p.models = [
    { id: `${id}-pro`, name: `${p.name} Pro`, context: 128000, multimodal: true, vision: true, reasoning: true, functionCalling: true, embedding: false, streaming: true, cost: "$0.01/1k" },
    { id: `${id}-lite`, name: `${p.name} Lite`, context: 32000, multimodal: false, vision: false, reasoning: false, functionCalling: true, embedding: false, streaming: true, cost: "$0.001/1k" },
  ];

  res.json({ success: true });
});

providersRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  if (providersDb[id]) {
    providersDb[id].encryptedKey = "";
    providersDb[id].status = "unconfigured";
    providersDb[id].priority = "none";
    providersDb[id].models = [];
  }
  res.json({ success: true });
});

providersRouter.post("/:id/verify", (req, res) => {
  const { id } = req.params;
  const p = providersDb[id];
  if (!p || !p.encryptedKey) {
    return res.status(400).json({ error: "Not configured" });
  }
  p.lastChecked = new Date().toISOString();
  p.latencyMs = Math.floor(Math.random() * 200) + 20;
  p.status = "active";
  res.json({ success: true, latencyMs: p.latencyMs });
});

providersRouter.post("/:id/toggle", (req, res) => {
  const { id } = req.params;
  const p = providersDb[id];
  if (p) {
    if (p.status === "active") p.status = "inactive";
    else if (p.status === "inactive") p.status = "active";
  }
  res.json({ success: true, status: p?.status });
});
