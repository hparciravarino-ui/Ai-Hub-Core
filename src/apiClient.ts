import { getAuthHeaders } from "./utils";

export async function getSystemStatus() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) return { status: "offline", initialized: false };
    return await response.json();
  } catch (e) {
    return { status: "offline", initialized: false };
  }
}

export async function chatAPI(message: string, history: any[], systemInstruction?: string, modelId?: string) {
  const response = await fetch("/api/inference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, systemInstruction, modelId })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Errore di connessione al Core Engine.");
  }

  const data = await response.json();
  return data.reply;
}

export async function diagnoseAPI(hardwareProfile: any, selectedProfile: string) {
  const response = await fetch("/api/diagnose", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hardwareProfile, selectedProfile })
  });

  if (!response.ok) {
    throw new Error("Errore durante la connessione al Diagnostic Engine.");
  }

  const data = await response.json();
  return data.reply;
}

export async function searchModelsAPI(query: string) {
  const response = await fetch(`/api/models/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error("Errore durante la connessione al Knowledge Engine.");
  }

  const data = await response.json();
  return data;
}

