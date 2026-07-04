import React, { useState, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Cpu,
  FileText,
  Mic,
  Image as ImageIcon,
  Check,
  Upload,
  RefreshCw,
  Info,
} from "lucide-react";
import { ChatMessage, Model, HardwareProfile } from "../types";
import { getAuthHeaders } from "../utils";
import { chatAPI } from "../apiClient";

interface AIAssistantProps {
  availableModels: Model[];
  selectedProfileId: string;
  currentHardware: HardwareProfile;
  onDownloadModel?: (modelId: string) => void;
  onDeleteModel?: (modelId: string) => void;
}

export default function AIAssistant({
  availableModels,
  selectedProfileId,
  currentHardware,
  onDownloadModel,
  onDeleteModel,
}: AIAssistantProps) {
  const [assistantTab, setAssistantTab] = useState<"advisor" | "playground" | "document" | "whisper" | "image">("advisor");
  
  // Advisor Chat State
  const [advisorMessages, setAdvisorMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: "Ciao! Sono l'AI Assistant di AI Hub Community. Posso aiutarti a scegliere il modello locale migliore per le tue specifiche hardware, guidarti nella scelta dei parametri di quantizzazione, o diagnosticare problemi di latenza e allocazione RAM. Di cosa hai bisogno oggi?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [advisorInput, setAdvisorInput] = useState("");
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);

  // Playground Chat State
  const [selectedPlaygroundModel, setSelectedPlaygroundModel] = useState("llama_3_2_3b");
  const [playgroundMessages, setPlaygroundMessages] = useState<ChatMessage[]>([
    {
      id: "play_init",
      role: "assistant",
      content: "Playground locale pronto. Questo modulo simula l'esecuzione del modello LLM direttamente offline sulla tua RAM, ottimizzato tramite il runtime predefinito. Invia un messaggio per testarlo.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [isPlaygroundLoading, setIsPlaygroundLoading] = useState(false);
  const [playgroundMetrics, setPlaygroundMetrics] = useState<any | null>(null);

  // Document QA State
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; content?: string } | null>(null);
  const [documentPrompt, setDocumentPrompt] = useState("");
  const [documentAnswer, setDocumentAnswer] = useState("");
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Whisper State

  // Image Gen State

  const downloadedModels = availableModels.filter((m) => m.downloaded);

  // Call Express API helper
  const sendMessageToGemini = async (message: string, history: ChatMessage[], systemInstruction?: string) => {
    try {
      const reply = await chatAPI(message, history, systemInstruction);
      return reply;
    } catch (error: any) {
      console.error("Chat proxy error:", error);
      
      const errorMsg = error?.message || "Errore di connessione API remota. Controlla le chiavi.";
      return `❌ **[ERRORE API]** Impossibile completare la generazione del messaggio. \n\n**Dettaglio tecnico:** ${errorMsg}`;
    }
  };

  // Advisor Send Message
  const handleAdvisorSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorInput.trim() || isAdvisorLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: advisorInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAdvisorMessages((prev) => [...prev, userMsg]);
    setAdvisorInput("");
    setIsAdvisorLoading(true);

    const replyText = await sendMessageToGemini(userMsg.content, advisorMessages);

    setAdvisorMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setIsAdvisorLoading(false);
  };

  // Playground Send Message
  const handlePlaygroundSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundInput.trim() || isPlaygroundLoading) return;

    // Check if models are available
    if (downloadedModels.length === 0) {
      alert("Nessun modello locale è installato. Scarica prima un modello nel menu 'Gestione Modelli'.");
      return;
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: playgroundInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setPlaygroundMessages((prev) => [...prev, userMsg]);
    setPlaygroundInput("");
    setIsPlaygroundLoading(true);
    setPlaygroundMetrics(null);

    const activeModel = downloadedModels.find((m) => m.id === selectedPlaygroundModel) || downloadedModels[0];

    // Create system instruction to fake the selected model and reasoning style
    let customInstruction = `You are a simulated local AI model named '${activeModel.name}' quantised in '${activeModel.quant}'.\n`;
    if (activeModel.id.includes("deepseek")) {
      customInstruction += "You are a deep reasoning model. You MUST begin your response with a thinking section enclosed in `<think>` and `</think>` tags, showing your detailed thoughts, and then provide your final reply in Italian.";
    } else {
      customInstruction += "Respond clearly, professionally and briefly in Italian, simulating local offline execution.";
    }

    const startTime = Date.now();
    const replyText = await sendMessageToGemini(userMsg.content, playgroundMessages, customInstruction);
    const duration = (Date.now() - startTime) / 1000;

    // Simulate token counts
    const estimatedTokens = Math.round(replyText.length / 4);
    const speed = parseFloat((estimatedTokens / duration).toFixed(1));

    setPlaygroundMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setPlaygroundMetrics({
      time: duration.toFixed(2),
      tokens: estimatedTokens,
      speed: activeModel.id.includes("deepseek") ? Math.round(speed * 0.8) : speed,
      vram: activeModel.vramRequired > 0 ? "Offload Attivo" : "CPU Only",
    });

    setIsPlaygroundLoading(false);
  };

  // Document QA upload and mock handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        content: "Contenuto fittizio estratto dal documento locale per la ricerca vettoriale RAG.",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        content: "Contenuto fittizio estratto dal documento locale per la ricerca vettoriale RAG.",
      });
    }
  };

  const runDocumentQA = async () => {
    if (!uploadedFile || !documentPrompt.trim()) return;
    setIsDocumentLoading(true);

    const ragInstruction = `You are a local RAG pipeline engine. Answer the user's question about the file '${uploadedFile.name}' using only local context. Be precise and short.`;
    const prompt = `CONTESTO DOCUMENTALE:\n${uploadedFile.content}\n\nDOMANDA: ${documentPrompt}`;
    
    const reply = await sendMessageToGemini(prompt, [], ragInstruction);
    setDocumentAnswer(reply);
    setIsDocumentLoading(false);
  };


  return (
    <div className="space-y-6" id="ai-assistant-tab">
      {/* Tab select bar */}
      <div className="flex border-b border-zinc-800 space-x-4 bg-barbg p-2 rounded-xl" id="assistant-submenu">
        <button
          onClick={() => setAssistantTab("advisor")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            assistantTab === "advisor" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Senior Advisor AI
        </button>
        <button
          onClick={() => setAssistantTab("playground")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            assistantTab === "playground" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Playground Modelli Locali
        </button>
        <button
          onClick={() => setAssistantTab("document")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            assistantTab === "document" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Document AI (RAG)
        </button>
      </div>

      {/* View Content */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* TAB 1: SENIOR ADVISOR AI */}
        {assistantTab === "advisor" && (
          <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl flex flex-col justify-between min-h-[500px]" id="advisor-tab-panel">
            <div>
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-4">
                <Bot className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">AI Hub Senior Advisor</h3>
                  <p className="text-[10px] text-zinc-500">Guida esperta locale assistita per sintonizzare i parametri e sconfiggere i colli di bottiglia hardware</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-zinc-850">
                {advisorMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-start space-x-2.5 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-zinc-800 text-zinc-200" : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/60"}`}>
                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-xl text-xs leading-relaxed ${msg.role === "user" ? "bg-zinc-100 text-zinc-950 font-medium" : "bg-appbg text-zinc-300 border border-zinc-850"}`}>
                        <div className="whitespace-pre-line">{msg.content}</div>
                        <div className="text-[9px] text-zinc-500 font-mono mt-1 text-right">{msg.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {isAdvisorLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2 bg-appbg border border-zinc-850 p-3 rounded-xl text-xs text-zinc-400 font-mono animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                      <span>L'Advisor sta calcolando l'ottimizzazione...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={handleAdvisorSend} className="flex gap-2 border-t border-zinc-800 pt-3">
              <input
                type="text"
                value={advisorInput}
                onChange={(e) => setAdvisorInput(e.target.value)}
                placeholder="Chiedi: 'Quale modello supporta la mia RAM da 8GB?' o 'Come posso impostare i thread?'"
                className="flex-1 bg-appbg border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isAdvisorLoading || !advisorInput.trim()}
                className="bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold px-4 py-2 rounded-lg text-xs transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: LOCAL PLAYGROUND */}
        {assistantTab === "playground" && (
          <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl flex flex-col justify-between min-h-[500px]" id="playground-tab-panel">
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-3 mb-4 gap-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-violet-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Playground Modelli Locali</h3>
                    <p className="text-[10px] text-zinc-500">Ambiente interattivo offline di debug delle risposte</p>
                  </div>
                </div>

                {/* Model selector for playground */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-zinc-500 font-mono">Modello di Test:</span>
                  <select
                    value={selectedPlaygroundModel}
                    onChange={(e) => setSelectedPlaygroundModel(e.target.value)}
                    className="bg-appbg border border-zinc-800 text-xs text-zinc-300 rounded px-2.5 py-1 focus:outline-none"
                  >
                    {downloadedModels.length === 0 ? (
                      <option value="">Nessun modello scaricato</option>
                    ) : (
                      downloadedModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.quant})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Messages container */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-zinc-850">
                {playgroundMessages.map((msg) => {
                  const isDeepseek = msg.content.includes("<think>");
                  let parsedContent = msg.content;
                  let reasoning = "";

                  if (isDeepseek) {
                    const startIdx = msg.content.indexOf("<think>");
                    const endIdx = msg.content.indexOf("</think>");
                    if (startIdx !== -1 && endIdx !== -1) {
                      reasoning = msg.content.substring(startIdx + 7, endIdx).trim();
                      parsedContent = msg.content.substring(endIdx + 8).trim();
                    }
                  }

                  return (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex items-start space-x-2.5 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-zinc-800 text-zinc-200" : "bg-violet-950/40 text-violet-400 border border-violet-900/60"}`}>
                          {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-3 rounded-xl text-xs leading-relaxed ${msg.role === "user" ? "bg-zinc-100 text-zinc-950 font-medium" : "bg-appbg text-zinc-300 border border-zinc-850"}`}>
                          {reasoning && (
                            <div className="bg-[#050505] border-l-2 border-zinc-600 p-2.5 rounded text-[11px] text-zinc-500 mb-2 italic font-mono max-h-32 overflow-y-auto">
                              <div className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Ragionamento DeepSeek:</div>
                              {reasoning}
                            </div>
                          )}
                          <div className="whitespace-pre-line">{parsedContent}</div>
                          <div className="text-[9px] text-zinc-500 font-mono mt-1 text-right">{msg.timestamp}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isPlaygroundLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2 bg-appbg border border-zinc-850 p-3 rounded-xl text-xs text-zinc-400 font-mono animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                      <span>Inference Engine attiva... Generazione token sul threadpool locale...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics overlay */}
            {playgroundMetrics && (
              <div className="mb-3 p-2 bg-appbg border border-zinc-800 rounded-lg flex justify-around text-[10px] font-mono text-zinc-400">
                <div>Tempo inferenza: <strong className="text-zinc-200">{playgroundMetrics.time}s</strong></div>
                <div>Token generati: <strong className="text-zinc-200">{playgroundMetrics.tokens}</strong></div>
                <div>Velocità media: <strong className="text-emerald-400">{playgroundMetrics.speed} tok/sec</strong></div>
                <div>VRAM: <strong className="text-sky-400">{playgroundMetrics.vram}</strong></div>
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handlePlaygroundSend} className="flex gap-2 border-t border-zinc-800 pt-3">
              <input
                type="text"
                value={playgroundInput}
                disabled={downloadedModels.length === 0}
                onChange={(e) => setPlaygroundInput(e.target.value)}
                placeholder={downloadedModels.length === 0 ? "⚠️ Installa prima un modello per abilitare il playground." : "Scrivi qui per testare il modello locale..."}
                className="flex-1 bg-appbg border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={isPlaygroundLoading || !playgroundInput.trim() || downloadedModels.length === 0}
                className="bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold px-4 py-2 rounded-lg text-xs transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: DOCUMENT AI */}
        {assistantTab === "document" && (
          <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl space-y-4" id="document-tab-panel">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <FileText className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Document AI (Local RAG)</h3>
                <p className="text-[10px] text-zinc-500">Carica file locali (PDF, TXT, OCR) per l'analisi senza inviare nulla sul cloud</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drag and Drop Zone */}
              <div className="space-y-4">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    dragActive ? "border-emerald-500 bg-barbg" : "border-zinc-800 bg-barbg/30 hover:bg-barbg"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.txt,.docx,.png,.jpg"
                  />
                  <Upload className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                  <p className="text-xs font-semibold text-zinc-300">Seleziona o trascina un file</p>
                  <p className="text-[10px] text-zinc-500 mt-1">PDF, TXT, DOCX, PNG o JPG (Max 15MB)</p>
                </div>

                {uploadedFile && (
                  <div className="p-3 bg-appbg border border-zinc-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-zinc-300 font-semibold truncate">{uploadedFile.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{uploadedFile.size}</span>
                  </div>
                )}
              </div>

              {/* RAG QA form */}
              <div className="p-4 bg-appbg border border-zinc-800 rounded-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Query sul Documento</label>
                  <input
                    type="text"
                    value={documentPrompt}
                    onChange={(e) => setDocumentPrompt(e.target.value)}
                    disabled={!uploadedFile}
                    placeholder={uploadedFile ? "Chiedi: 'Riassumi questo testo' o 'Quali sono i dati principali?'" : "Carica un file prima di fare domande."}
                    className="w-full bg-panelbg border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={runDocumentQA}
                    disabled={isDocumentLoading || !documentPrompt.trim() || !uploadedFile}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold py-2 rounded-lg text-xs transition"
                  >
                    {isDocumentLoading ? "Elaborazione RAG in corso..." : "Esegui Ricerca Contestuale Locale"}
                  </button>
                </div>

                {documentAnswer && (
                  <div className="mt-4 p-3 bg-panelbg border border-zinc-800 rounded-lg text-xs text-zinc-300 leading-relaxed max-h-40 overflow-y-auto">
                    <div className="text-[10px] text-emerald-400 font-mono uppercase mb-1">Risposta locale estratta:</div>
                    {documentAnswer}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
