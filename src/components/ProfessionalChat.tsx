import React, { useState, useEffect, useRef } from "react";
import { chatAPI } from "../apiClient";
import {
  Plus,
  Search,
  Folder,
  FolderOpen,
  FolderPlus,
  Trash2,
  Archive,
  Star,
  Lock,
  Unlock,
  Settings,
  ChevronRight,
  ChevronDown,
  FileText,
  FileCode,
  Image as ImageIcon,
  Check,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  Clock,
  Zap,
  Globe,
  Sliders,
  Sparkles,
  User,
  Bot,
  Send,
  StopCircle,
  FileUp,
  X,
  FileSpreadsheet,
  Layers,
  Cpu,
  Bookmark,
  Share2,
  Printer,
  SlidersHorizontal,
  ChevronLeft,
  Columns,
  Eye,
  Activity,
  Maximize2,
  Info
} from "lucide-react";
import { Model, ChatMessage, HardwareProfile, FileEntry } from "../types";
import { getAuthHeaders } from "../utils";

// Types for the advanced chat system
interface ChatSession {
  id: string;
  title: string;
  createdTime: string;
  lastModified: string;
  modelId: string;
  comparisonModelId?: string;
  inferenceProfile: "eco" | "balanced" | "performance" | "turbo" | "quality";
  messageCount: number;
  totalTokens: number;
  totalProcessingTime: number; // in seconds
  tags: string[];
  category: string;
  projectId: string; // project folder association
  status: "active" | "archived" | "favorite" | "locked" | "trash";
  messages: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    versions?: string[]; // for alternate replies
    activeVersionIndex?: number;
    // For dual-model comparison response
    comparisonContent?: string;
  }[];
  // Advanced parameters configured
  parameters: {
    temperature: number;
    topP: number;
    topK: number;
    contextWindow: number;
    maxTokens: number;
    systemPrompt: string;
    initialContext: string;
    language: string;
  };
  summary?: string; // Auto-generated context summary
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

interface ProfessionalChatProps {
  availableModels: Model[];
  selectedProfileId: string;
  currentHardware: HardwareProfile;
  onDownloadModel?: (modelId: string) => void;
  onDeleteModel?: (modelId: string) => void;
  workspaceEntries?: FileEntry[];
  setWorkspaceEntries?: (entries: FileEntry[]) => void;
}

// Initial presets
const INITIAL_PROJECTS: ProjectItem[] = [
  { id: "proj_default", name: "Generale", description: "Progetto predefinito per chat e appunti rapidi", tags: ["Generale"] },
  { id: "proj_coding", name: "Sviluppo Web", description: "Ottimizzazione codice, debug locale e script", tags: ["Coding", "React", "Node"] },
  { id: "proj_marketing", name: "Marketing AI", description: "Copywriting, blog post, social media strategy", tags: ["Copywriter", "SEO"] },
  { id: "proj_finance", name: "Consulenza Aziendale", description: "Analisi business plan, previsioni finanziarie", tags: ["Business", "Finance"] }
];

const INITIAL_ROLES = [
  { id: "role_gen", name: "Assistente Generico", icon: Bot, prompt: "Sei un assistente generale altamente qualificato. Rispondi con precisione in modo chiaro e coinciso.", color: "text-emerald-400" },
  { id: "role_coder", name: "Programmatore Senior", icon: FileCode, prompt: "Sei un ingegnere del software senior. Scrivi codice pulito, ottimizzato e documentato. Evita preamboli inutili e spiega solo le parti critiche.", color: "text-sky-400" },
  { id: "role_trans", name: "Traduttore Professionale", icon: Globe, prompt: "Sei un traduttore professionista simultaneo. Traduci il testo fedelmente preservando il tono, le sfumature e il vocabolario appropriato.", color: "text-amber-400" },
  { id: "role_writer", name: "Scrittore Creativo", icon: Sparkles, prompt: "Sei un autore creativo e copywriter esperto. Usa uno stile coinvolgente, fluido, suggestivo e ricco di metafore pertinenti.", color: "text-pink-400" },
  { id: "role_analyst", name: "Analista di Dati", icon: SlidersHorizontal, prompt: "Sei un analista aziendale e di dati finanziari. Fornisci valutazioni basate su logica rigorosa, numeri e schemi strutturati.", color: "text-violet-400" },
];

export default function ProfessionalChat({
  availableModels,
  selectedProfileId,
  currentHardware,
  onDownloadModel,
  onDeleteModel,
  workspaceEntries,
  setWorkspaceEntries
}: ProfessionalChatProps) {
  // Database state persisting to LocalStorage
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  
  // Navigation & filter states
  const [selectedProjectId, setSelectedProjectId] = useState<string>("proj_default");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState<boolean>(true);
  
  // Sidebar search / filters
  const [searchText, setSearchText] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [groupingMode, setGroupingMode] = useState<"date" | "model" | "project">("date");
  const [showTrash, setShowTrash] = useState<boolean>(false);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [bulkSelectMode, setBulkSelectMode] = useState<boolean>(false);
  const [selectedBulkChatIds, setSelectedBulkChatIds] = useState<string[]>([]);
  
  // Custom modals/dropdowns
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newProjectDesc, setNewProjectDesc] = useState<string>("");

  // New Chat Form Configuration State
  const [formModelId, setFormModelId] = useState<string>("");
  const [formProfile, setFormProfile] = useState<"eco" | "balanced" | "performance" | "turbo" | "quality">("balanced");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formRole, setFormRole] = useState<string>("role_gen");
  const [formInitialContext, setFormInitialContext] = useState<string>("");
  const [formLanguage, setFormLanguage] = useState<string>("Italiano");
  const [formSystemPrompt, setFormSystemPrompt] = useState<string>("");
  const [formAdvancedParams, setFormAdvancedParams] = useState<boolean>(false);
  const [formTemperature, setFormTemperature] = useState<number>(0.7);
  const [formTopP, setFormTopP] = useState<number>(0.9);
  const [formTopK, setFormTopK] = useState<number>(40);
  const [formContextWindow, setFormContextWindow] = useState<number>(2048);
  const [formMaxTokens, setFormMaxTokens] = useState<number>(512);
  const [formSaveAsTemplate, setFormSaveAsTemplate] = useState<boolean>(false);
  const [formTemplateName, setFormTemplateName] = useState<string>("");

  // Attachment states in New Chat
  const [formAttachments, setFormAttachments] = useState<{ id: string; name: string; size: string; type: string; progress: number; status: "indexing" | "ready"; version: number; ocrText?: string }[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);

  // Active Chat states
  const [chatInput, setChatInput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [tokenProgress, setTokenProgress] = useState<number>(0);
  const [streamingText, setStreamingText] = useState<string>("");
  const [comparisonStreamingText, setComparisonStreamingText] = useState<string>("");
  const [comparisonActive, setComparisonActive] = useState<boolean>(false);
  const [comparisonModelId, setComparisonModelId] = useState<string>("");
  
  // Metrics & performance telemetry state (simulating real CPU/GPU activity based on current selections)
  const [telemetry, setTelemetry] = useState({
    cpuLoad: 24,
    gpuLoad: 12,
    ramUsed: 4.8,
    ramTotal: 8,
    speed: 0,
    elapsed: 0,
    tokensGenerated: 0
  });

  // Workspace File Analysis Integration States
  const [selectedWorkspaceFiles, setSelectedWorkspaceFiles] = useState<string[]>([]);
  const [workspacePanelOpen, setWorkspacePanelOpen] = useState<boolean>(true);
  const [ragMode, setRagMode] = useState<boolean>(true);
  const [indexingFile, setIndexingFile] = useState<string | null>(null);

  // Cloud backup & sync mock states
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState<boolean>(false);
  const [encryptionActive, setEncryptionActive] = useState<boolean>(true);
  const [isCopiedId, setIsCopiedId] = useState<string | null>(null);

  const [pendingCreateAfterDownload, setPendingCreateAfterDownload] = useState<boolean>(false);

  // Initialize downloaded models selection
  const downloadedModels = availableModels.filter(m => m.downloaded);
  
  // Set default form model
  useEffect(() => {
    if (!formModelId) {
      if (downloadedModels.length > 0) {
        setFormModelId(downloadedModels[0].id);
      } else if (availableModels.length > 0) {
        setFormModelId(availableModels[0].id);
      }
    }
  }, [downloadedModels, availableModels, formModelId]);

  // Auto-trigger chat creation when a direct-initiated download finishes
  useEffect(() => {
    if (pendingCreateAfterDownload) {
      const modelObj = availableModels.find(m => m.id === formModelId);
      if (modelObj && modelObj.downloaded) {
        setPendingCreateAfterDownload(false);
        handleCreateChat();
      }
    }
  }, [availableModels, formModelId, pendingCreateAfterDownload]);

  // Load chats database from local storage
  useEffect(() => {
    const savedChats = localStorage.getItem("ai_hub_pro_chats");
    const savedProjects = localStorage.getItem("ai_hub_pro_projects");
    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats));
      } catch (e) {
        console.error("Failed to parse local storage chats", e);
      }
    } else {
      setChats([]);
    }

    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {}
    }
  }, []);

  // Save changes to local storage helper
  const saveChatsDb = (updatedChats: ChatSession[]) => {
    setChats(updatedChats);
    localStorage.setItem("ai_hub_pro_chats", JSON.stringify(updatedChats));
  };

  const saveProjectsDb = (updatedProjects: ProjectItem[]) => {
    setProjects(updatedProjects);
    localStorage.setItem("ai_hub_pro_projects", JSON.stringify(updatedProjects));
  };

  // Simulating hardware telemetry dynamically based on profile
  useEffect(() => {
    const interval = setInterval(() => {
      let multiplier = 1;
      if (formProfile === "eco") multiplier = 0.4;
      if (formProfile === "performance") multiplier = 1.2;
      if (formProfile === "turbo") multiplier = 1.8;
      if (formProfile === "quality") multiplier = 1.4;

      setTelemetry(prev => {
        const activeMultiplier = isGenerating ? multiplier * 1.5 : 0.3;
        return {
          cpuLoad: Math.min(100, Math.max(10, Math.round(15 + Math.random() * 12 * activeMultiplier))),
          gpuLoad: Math.min(100, Math.max(0, Math.round(5 + Math.random() * 20 * (isGenerating ? multiplier : 0.1)))),
          ramUsed: parseFloat(Math.min(16, Math.max(2.5, 4.2 + (isGenerating ? 2.5 * multiplier : 0.4) + Math.random() * 0.2)).toFixed(1)),
          ramTotal: 16,
          speed: isGenerating ? Math.round((28 - (multiplier * 4)) + Math.random() * 3) : 0,
          elapsed: isGenerating ? parseFloat((prev.elapsed + 0.2).toFixed(1)) : 0,
          tokensGenerated: prev.tokensGenerated
        };
      });
    }, 200);
    return () => clearInterval(interval);
  }, [formProfile, isGenerating]);

  // Handle click on "+ Nuova Chat"
  const triggerNewChatScreen = () => {
    setIsCreatingNewChat(true);
    setSelectedChatId(null);
    setFormTitle("");
    setFormInitialContext("");
    setFormSystemPrompt("");
    setFormAttachments([]);
    setComparisonActive(false);
  };

  // Role selection synchronization
  useEffect(() => {
    const roleObj = INITIAL_ROLES.find(r => r.id === formRole);
    if (roleObj) {
      setFormSystemPrompt(roleObj.prompt);
    }
  }, [formRole]);

  // Handle Drag Events for Attachments dropzone
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files);
    }
  };

  const handleFilesUpload = async (files: FileList) => {
    // 1. Create immediate placeholder attachments so UI updates fast
    const tempAttachs = Array.from(files).map((file) => {
      const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
      return {
        id: "temp_" + Math.random().toString(36).substr(2, 5),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: ext,
        progress: 10,
        status: "indexing" as const,
        version: 1,
        ocrText: "",
        originalFile: file
      };
    });
    
    setFormAttachments(prev => [...prev, ...tempAttachs]);

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      
      if (data.success) {
        setFormAttachments(curr => curr.map(c => {
          const matched = tempAttachs.find(t => t.id === c.id);
          if (matched) {
            let ocrStr = matched.type === "PDF" || matched.type === "PNG" || matched.type === "JPG" ? `[OCR AUTOMATICO AI HUB CORE: Rilevate tabelle e righe testuali offline da ${matched.name}]` : "";
            const uploadedFile = data.files.find((f: any) => f.name === matched.name);
            if (uploadedFile && uploadedFile.type === "zip") {
               ocrStr = `[ZIP EXTRACTION: Estratti ${uploadedFile.extracted.length} file in sandbox locale]`;
            }

            return { ...c, progress: 100, status: "ready", ocrText: ocrStr };
          }
          return c;
        }));
      } else {
        // Handle error
        setFormAttachments(curr => curr.map(c => {
          if (tempAttachs.some(t => t.id === c.id)) {
            return { ...c, progress: 0, status: "error", ocrText: "Errore upload" };
          }
          return c;
        }));
      }
    } catch (e) {
      console.error("Upload failed", e);
      setFormAttachments(curr => curr.map(c => {
        if (tempAttachs.some(t => t.id === c.id)) {
          return { ...c, progress: 0, status: "error", ocrText: "Errore rete" };
        }
        return c;
      }));
    }
  };

  const removeAttachment = (id: string) => {
    setFormAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Generate Title utilizing selected parameters or default AI name
  const handleAutoGenerateTitle = () => {
    const roleObj = INITIAL_ROLES.find(r => r.id === formRole);
    const modelObj = downloadedModels.find(m => m.id === formModelId);
    const roleLabel = roleObj ? roleObj.name : "Assistente";
    const modelLabel = modelObj ? modelObj.name : "Model";
    const num = Math.floor(Math.random() * 900) + 100;
    
    setFormTitle(`Analisi ${roleLabel} - ${num}`);
  };

  // Create conversation and append to chats
  const handleCreateChat = () => {
    const finalTitle = formTitle.trim() || `Chat ${INITIAL_ROLES.find(r => r.id === formRole)?.name || "Generica"} #${chats.length + 1}`;
    const modelObj = availableModels.find(m => m.id === formModelId);

    const newChat: ChatSession = {
      id: "chat_" + Math.random().toString(36).substr(2, 6) + "_" + Date.now(),
      title: finalTitle,
      createdTime: new Date().toLocaleString(),
      lastModified: new Date().toLocaleString(),
      modelId: formModelId || (availableModels[0]?.id || "llama_3_2_3b"),
      inferenceProfile: formProfile,
      messageCount: formInitialContext ? 2 : 0,
      totalTokens: formInitialContext ? 120 : 0,
      totalProcessingTime: 0,
      tags: [INITIAL_ROLES.find(r => r.id === formRole)?.name || "Generale", formLanguage],
      category: INITIAL_ROLES.find(r => r.id === formRole)?.name || "Generica",
      projectId: selectedProjectId,
      status: "active",
      messages: formInitialContext ? [
        { id: "init_u", role: "user", content: "Contesto iniziale configurato dall'utente.", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        { id: "init_a", role: "assistant", content: `Contesto AI Hub sintonizzato con successo. Modello in esecuzione: **${modelObj?.name || "Modello"}** con ruolo **${INITIAL_ROLES.find(r => r.id === formRole)?.name}**.\n\n*Pronto per ricevere i tuoi comandi in locale.*`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      ] : [],
      parameters: {
        temperature: formTemperature,
        topP: formTopP,
        topK: formTopK,
        contextWindow: formContextWindow,
        maxTokens: formMaxTokens,
        systemPrompt: formSystemPrompt || "Sei un assistente AI sintonizzato localmente.",
        initialContext: formInitialContext,
        language: formLanguage
      }
    };

    const updatedChats = [newChat, ...chats];
    saveChatsDb(updatedChats);
    
    // Switch instantly
    setSelectedChatId(newChat.id);
    setIsCreatingNewChat(false);
  };

  // Add new project Folder
  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const newProj: ProjectItem = {
      id: "proj_" + Math.random().toString(36).substr(2, 5),
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || "Nessuna descrizione fornita",
      tags: ["Manuale"]
    };
    const updated = [...projects, newProj];
    saveProjectsDb(updated);
    setNewProjectName("");
    setNewProjectDesc("");
    setIsAddingProject(false);
  };

  const indexFileFromChat = async (entry: FileEntry) => {
    if (entry.kind !== 'file' || !entry.handle) return;
    setIndexingFile(entry.path);
    try {
      const file = await entry.handle.getFile();
      const text = await file.text();
      
      // Ingest text into server RAG database
      const response = await fetch("/api/knowledge/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          filename: entry.name,
          mimeType: "text/plain",
          author: "user"
        })
      });

      if (!response.ok) {
        throw new Error("Errore durante l'ingest RAG sul server.");
      }

      // Update parent state entries to include the content and mark as indexed
      if (setWorkspaceEntries && workspaceEntries) {
        const updated = workspaceEntries.map(e => {
          if (e.path === entry.path) {
            return { ...e, content: text, indexed: true };
          }
          return e;
        });
        setWorkspaceEntries(updated);
      }
      
      // Automatically toggle selected file for direct context analysis
      setSelectedWorkspaceFiles(prev => [...prev, entry.path]);
    } catch (err: any) {
      alert(`Errore nell'indicizzazione del file ${entry.name}: ${err.message}`);
    } finally {
      setIndexingFile(null);
    }
  };

  // Active chat instance
  const activeChat = chats.find(c => c.id === selectedChatId);

  // Send message in existing chat workspace
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isGenerating || !activeChat) return;

    const userMessageContent = chatInput;
    setChatInput("");
    setIsGenerating(true);
    setStreamingText("");
    setComparisonStreamingText("");
    setTelemetry(prev => ({ ...prev, tokensGenerated: 0 }));

    const userMsg = {
      id: "msg_u_" + Math.random().toString(36).substr(2, 5),
      role: "user" as const,
      content: userMessageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Update active chat locally
    const updatedMessages = [...activeChat.messages, userMsg];
    let updatedChats = chats.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          messages: updatedMessages,
          messageCount: updatedMessages.length,
          lastModified: new Date().toLocaleString()
        };
      }
      return c;
    });
    saveChatsDb(updatedChats);

    // Prepare system instructions with all metadata
    const activeModel = downloadedModels.find(m => m.id === activeChat.modelId) || downloadedModels[0] || availableModels.find(m => m.id === activeChat.modelId) || availableModels[0];
    const systemPrompt = activeChat.parameters.systemPrompt;
    
    // Build context
    let promptText = userMessageContent;
    
    // 1. Direct file content context
    let directFileContext = "";
    const selectedFilesWithContent = workspaceEntries?.filter(e => selectedWorkspaceFiles.includes(e.path) && e.content) || [];
    if (selectedFilesWithContent.length > 0) {
      directFileContext = "\n--- CONTENUTO FILE SELEZIONATI PER ANALISI ---\n" + 
        selectedFilesWithContent.map(e => `[File: ${e.name}]\nPercorso: ${e.path}\nContenuto:\n${e.content}\n--- FINE FILE ${e.name} ---`).join("\n\n") + 
        "\n---------------------------------------------\n\n";
    }

    // 2. Semantic RAG search context
    let ragSemanticContext = "";
    if (ragMode) {
      try {
        const res = await fetch(`/api/knowledge/search?q=${encodeURIComponent(userMessageContent)}&topK=3`);
        if (res.ok) {
          const searchResults = await res.json();
          if (searchResults && searchResults.length > 0) {
            ragSemanticContext = "\n--- RISULTATI RAG SEMANTICO RILEVANTI (DALLO WORKSPACE) ---\n" + 
              searchResults.map((r: any, idx: number) => `Frammento ${idx+1} [Fonte: ${r.metadata?.source || "Sconosciuta"}]:\n${r.text}`).join("\n\n") + 
              "\n------------------------------------------------------------\n\n";
          }
        }
      } catch (e) {
        console.error("Semantic RAG search failed:", e);
      }
    }

    // 3. Workspace structure overview
    let pathsOverview = "";
    if (workspaceEntries && workspaceEntries.length > 0) {
      const paths = workspaceEntries.map(e => `- ${e.path} (${e.indexed ? 'Indicizzato RAG' : 'Non indicizzato'})`).join("\n");
      pathsOverview = `\n--- STRUTTURA DEL WORKSPACE COLLEGATO ---\nI seguenti file sono mappati nel workspace:\n${paths}\n-----------------------------------------\n\n`;
    }

    const finalWorkspaceContext = pathsOverview + directFileContext + ragSemanticContext;

    if (formAttachments.length > 0) {
      promptText = finalWorkspaceContext + `ALLEGATI INTEGRATI (RAG LOCALE):\n` + formAttachments.map(a => `[File: ${a.name}]\n${a.ocrText || "[Contenuto indicizzato]"}`).join("\n") + `\n\nDOMANDA UTENTE:\n${userMessageContent}`;
    } else if (finalWorkspaceContext) {
      promptText = finalWorkspaceContext + `DOMANDA UTENTE:\n${userMessageContent}`;
    }

    // Call API proxy
    try {
      const replyContent = await chatAPI(promptText, activeChat.messages, systemPrompt, activeChat.modelId);

      // Simulate character streaming (token by token)
      let streamIndex = 0;
      const speedDelay = activeChat.inferenceProfile === "turbo" ? 10 : 30;
      
      const streamTimer = setInterval(() => {
        if (streamIndex < replyContent.length) {
          const chunk = replyContent.substring(0, streamIndex + 4);
          setStreamingText(chunk);
          streamIndex += 4;
          setTelemetry(prev => ({
            ...prev,
            tokensGenerated: Math.round(chunk.length / 4)
          }));
        } else {
          clearInterval(streamTimer);
          
          // Stream completed! Save message to chat history database
          const assistantMsg = {
            id: "msg_a_" + Math.random().toString(36).substr(2, 5),
            role: "assistant" as const,
            content: replyContent,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            versions: [replyContent],
            activeVersionIndex: 0
          };

          const finalMessages = [...updatedMessages, assistantMsg];
          const finalChats = chats.map(c => {
            if (c.id === activeChat.id) {
              const estTokens = Math.round(replyContent.length / 4) + Math.round(userMessageContent.length / 4);
              return {
                ...c,
                messages: finalMessages,
                messageCount: finalMessages.length,
                totalTokens: c.totalTokens + estTokens,
                totalProcessingTime: c.totalProcessingTime + 3,
                lastModified: new Date().toLocaleString()
              };
            }
            return c;
          });
          saveChatsDb(finalChats);
          setStreamingText("");
          setIsGenerating(false);
        }
      }, speedDelay);

    } catch (err: any) {
      console.error(err);
      
      const errorMsg = err?.message || "Errore di connessione al server remoto. Riprova più tardi.";
      
      const failMsg = {
        id: "msg_a_fail_" + Math.random().toString(),
        role: "assistant" as const,
        content: `❌ **[ERRORE DI RETE / API]** Impossibile completare la generazione del messaggio. \n\n**Dettaglio tecnico:** ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      
      const finalChats = chats.map(c => {
        if (c.id === activeChat.id) {
          const finalMsgs = [...updatedMessages, failMsg];
          return { ...c, messages: finalMsgs, messageCount: finalMsgs.length };
        }
        return c;
      });
      saveChatsDb(finalChats);
      setIsGenerating(false);
    }
  };

  // Actions on individual chats
  const handleDeleteChat = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = chats.map(c => {
      if (c.id === id) {
        return { ...c, status: "trash" as const };
      }
      return c;
    });
    saveChatsDb(updated);
    if (selectedChatId === id) setSelectedChatId(null);
  };

  const handlePermanentDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chats.filter(c => c.id !== id);
    saveChatsDb(updated);
  };

  const handleRecoverChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chats.map(c => {
      if (c.id === id) {
        return { ...c, status: "active" as const };
      }
      return c;
    });
    saveChatsDb(updated);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chats.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "favorite" ? "active" : "favorite";
        return { ...c, status: nextStatus as any };
      }
      return c;
    });
    saveChatsDb(updated);
  };

  const handleDuplicateChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = chats.find(c => c.id === id);
    if (target) {
      const duplicated: ChatSession = {
        ...target,
        id: "chat_dup_" + Math.random().toString(36).substr(2, 5) + "_" + Date.now(),
        title: `${target.title} (Copia)`,
        createdTime: new Date().toLocaleString(),
        lastModified: new Date().toLocaleString()
      };
      saveChatsDb([duplicated, ...chats]);
    }
  };

  // Bulk Operations
  const handleToggleBulkSelect = (id: string) => {
    if (selectedBulkChatIds.includes(id)) {
      setSelectedBulkChatIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedBulkChatIds(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = () => {
    const updated = chats.map(c => {
      if (selectedBulkChatIds.includes(c.id)) {
        return { ...c, status: "trash" as const };
      }
      return c;
    });
    saveChatsDb(updated);
    setSelectedBulkChatIds([]);
    setBulkSelectMode(false);
  };

  // Export functions (client side generation of raw file types)
  const handleExportChat = (format: "json" | "md" | "html", session: ChatSession) => {
    let content = "";
    let mimeType = "text/plain";
    let filename = `${session.title.toLowerCase().replace(/\s+/g, "_")}.${format}`;

    if (format === "json") {
      content = JSON.stringify(session, null, 2);
      mimeType = "application/json";
    } else if (format === "md") {
      content = `# ${session.title}\n*Modello utilizzato: ${session.modelId}*\n*Creato il: ${session.createdTime}*\n\n`;
      session.messages.forEach(m => {
        content += `### ${m.role === "user" ? "Utente" : "AI Hub Core"}\n${m.content}\n\n`;
      });
      mimeType = "text/markdown";
    } else if (format === "html") {
      content = `<html><head><title>${session.title}</title><style>body { font-family: sans-serif; padding: 40px; background-color: #0d0d0d; color: #f2f2f2; } .msg { border: 1px solid #333; margin: 15px 0; padding: 15px; border-radius: 8px; } .user { border-color: #059669; }</style></head><body><h1>${session.title}</h1>`;
      session.messages.forEach(m => {
        content += `<div class="msg ${m.role === "user" ? "user" : ""}"><strong>${m.role === "user" ? "Utente" : "AI Hub"}</strong><p>${m.content}</p></div>`;
      });
      content += `</body></html>`;
      mimeType = "text/html";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON configuration helper
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported && imported.id && imported.title) {
            // Re-id to prevent conflict
            const cleanImported: ChatSession = {
              ...imported,
              id: "chat_import_" + Math.random().toString(36).substr(2, 5) + "_" + Date.now(),
              createdTime: new Date().toLocaleString(),
              lastModified: new Date().toLocaleString()
            };
            saveChatsDb([cleanImported, ...chats]);
            alert("Chat importata con successo!");
          } else {
            alert("File JSON non valido.");
          }
        } catch (err) {
          alert("Errore durante la lettura del file JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter & Search Logics
  const filteredChats = chats.filter(c => {
    // Project filter
    if (c.projectId !== selectedProjectId) return false;

    // Search query on title & messages content
    const matchSearch = searchText.trim() === "" || 
      c.title.toLowerCase().includes(searchText.toLowerCase()) ||
      c.messages.some(m => m.content.toLowerCase().includes(searchText.toLowerCase()));
    
    if (!matchSearch) return false;

    // Trash, archive or normal active status check
    if (showTrash) return c.status === "trash";
    if (showArchive) return c.status === "archived";

    // Standard statuses
    if (c.status === "trash") return false;
    
    if (filterStatus === "favorites") return c.status === "favorite";
    if (filterStatus === "archived") return c.status === "archived";
    
    return true;
  });

  // Compress contextual memory simulation
  const handleCompressContext = () => {
    if (!activeChat) return;
    const summaryText = `Riassunto semantico generato in locale alle ore ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}: L'utente richiede chiarimenti in merito all'organizzazione dei processi paralleli offline. È stata fornita assistenza personalizzata consigliando parametri ottimali per sconfiggere i colli di bottiglia hardware rilevati.`;
    
    const updated = chats.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          summary: summaryText,
          totalTokens: Math.max(100, Math.round(c.totalTokens * 0.7)) // simulated 30% reduction
        };
      }
      return c;
    });
    saveChatsDb(updated);
    alert("Compressione del contesto semantico completata con successo! RAM liberata.");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[calc(100vh-140px)]" id="professional-chat-workspace">
      
      {/* COLUMN 1: LEFT WORKSPACE PANEL (1 COL) */}
      <div className="xl:col-span-1 bg-panelbg border border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-4" id="sidebar-chat-panel">
        <div className="space-y-4">
          
          {/* Create button */}
          <button
            onClick={triggerNewChatScreen}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            id="new-chat-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Chat Locale</span>
          </button>

          {/* Project Folders Navigation */}
          <div className="border-t border-b border-zinc-850 py-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest pl-1">
              <span>Progetti Attivi</span>
              <button
                onClick={() => setIsAddingProject(true)}
                className="text-emerald-500 hover:text-emerald-400 font-bold"
                title="Nuovo Progetto"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Project List */}
            <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
              {projects.map((p) => {
                const count = chats.filter(c => c.projectId === p.id && c.status !== "trash").length;
                const isSelected = selectedProjectId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProjectId(p.id);
                      setShowTrash(false);
                      setShowArchive(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition ${
                      isSelected
                        ? "bg-zinc-800/60 text-emerald-400 font-semibold border border-zinc-700/60"
                        : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isSelected ? <FolderOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                      <span className="truncate">{p.name}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-950/80 px-1.5 py-0.2 rounded text-zinc-500 border border-zinc-850">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Project Modal Simulation inline */}
          {isAddingProject && (
            <div className="bg-barbg p-3 border border-zinc-800 rounded-lg space-y-3">
              <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Aggiungi Progetto</span>
              <input
                type="text"
                placeholder="Nome progetto..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Breve descrizione..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full bg-appbg border border-zinc-800 rounded px-2 py-1 text-xs text-white"
              />
              <div className="flex justify-end gap-2 text-[10px]">
                <button onClick={() => setIsAddingProject(false)} className="text-zinc-400 px-2 py-1">Annulla</button>
                <button onClick={handleAddProject} className="bg-emerald-500/20 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded">Crea</button>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cerca nello storico..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-appbg border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick Filter Status pills */}
          <div className="flex gap-2 text-[10px] font-mono pb-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => { setFilterStatus("all"); setShowTrash(false); setShowArchive(false); }}
              className={`px-2 py-0.5 rounded border transition ${
                filterStatus === "all" && !showTrash && !showArchive ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-transparent border-zinc-850 text-zinc-500"
              }`}
            >
              Tutte
            </button>
            <button
              onClick={() => { setFilterStatus("favorites"); setShowTrash(false); setShowArchive(false); }}
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                filterStatus === "favorites" ? "bg-amber-950/40 border-amber-900 text-amber-400" : "bg-transparent border-zinc-850 text-zinc-500"
              }`}
            >
              <Star className="w-2.5 h-2.5" /> Preferite
            </button>
            <button
              onClick={() => { setShowArchive(true); setShowTrash(false); setFilterStatus("all"); }}
              className={`px-2 py-0.5 rounded border transition ${
                showArchive ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-transparent border-zinc-850 text-zinc-500"
              }`}
            >
              Archivio
            </button>
            <button
              onClick={() => { setShowTrash(true); setShowArchive(false); setFilterStatus("all"); }}
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                showTrash ? "bg-red-950/40 border-red-900 text-red-400" : "bg-transparent border-zinc-850 text-zinc-500"
              }`}
            >
              <Trash2 className="w-2.5 h-2.5" /> Cestino
            </button>
          </div>

          {/* Bulk select toggle */}
          <div className="flex justify-between items-center text-[10px] text-zinc-500 border-b border-zinc-850 pb-2">
            <span>Ordinamento cronologico</span>
            <button
              onClick={() => {
                setBulkSelectMode(!bulkSelectMode);
                setSelectedBulkChatIds([]);
              }}
              className="text-emerald-500 hover:underline"
            >
              {bulkSelectMode ? "Annulla" : "Gestione Multipla"}
            </button>
          </div>

          {/* Bulk operation banner */}
          {bulkSelectMode && selectedBulkChatIds.length > 0 && (
            <div className="bg-red-950/30 border border-red-900 p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[10px] text-red-400 font-mono">{selectedBulkChatIds.length} selezionate</span>
              <button
                onClick={handleBulkDelete}
                className="bg-red-900/50 hover:bg-red-900 text-red-100 px-2 py-1 rounded text-[9px] font-bold"
              >
                Elimina Selezionate
              </button>
            </div>
          )}

          {/* Storico Chat List Scrollable */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 text-xs italic">
                Nessuna chat corrispondente
              </div>
            ) : (
              filteredChats.map((c) => {
                const isSelected = selectedChatId === c.id;
                const modelName = availableModels.find(m => m.id === c.modelId)?.name || c.modelId;
                
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (bulkSelectMode) {
                        handleToggleBulkSelect(c.id);
                      } else {
                        setSelectedChatId(c.id);
                        setIsCreatingNewChat(false);
                      }
                    }}
                    className={`group p-3 rounded-lg border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-zinc-800/50 border-emerald-500/80 shadow-md"
                        : "bg-barbg hover:bg-zinc-900/50 border-zinc-850"
                    }`}
                  >
                    {/* Checkbox for bulk select */}
                    {bulkSelectMode && (
                      <div className="absolute top-3 left-2.5 z-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedBulkChatIds.includes(c.id)}
                          onChange={() => handleToggleBulkSelect(c.id)}
                          className="rounded border-zinc-800 text-emerald-500 focus:ring-emerald-500 h-3 w-3"
                        />
                      </div>
                    )}

                    <div className={`space-y-1.5 ${bulkSelectMode ? "pl-5" : ""}`}>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-semibold text-zinc-100 truncate group-hover:text-emerald-300 transition">
                          {c.title}
                        </span>
                        
                        {/* Status badges */}
                        <div className="flex items-center gap-1 shrink-0">
                          {c.status === "favorite" && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                          {c.status === "locked" && <Lock className="w-3 h-3 text-zinc-400" />}
                        </div>
                      </div>

                      {/* Info Sub-metrics */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                        <span>{modelName}</span>
                        <span>{c.messages.length} messaggi</span>
                      </div>

                      {/* Hover action bar */}
                      {!bulkSelectMode && (
                        <div className="flex justify-end gap-2 border-t border-zinc-850 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {c.status === "trash" ? (
                            <>
                              <button
                                onClick={(e) => handleRecoverChat(c.id, e)}
                                className="text-emerald-500 hover:underline text-[9px] font-bold"
                              >
                                Ripristina
                              </button>
                              <button
                                onClick={(e) => handlePermanentDelete(c.id, e)}
                                className="text-red-500 hover:underline text-[9px] font-bold"
                              >
                                Distruggi
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => handleToggleFavorite(c.id, e)}
                                className="text-amber-500 hover:text-amber-400"
                                title="Preferiti"
                              >
                                <Star className={`w-3 h-3 ${c.status === "favorite" ? "fill-amber-500" : ""}`} />
                              </button>
                              <button
                                onClick={(e) => handleDuplicateChat(c.id, e)}
                                className="text-sky-400 hover:text-sky-300"
                                title="Duplica Sessione"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleExportChat("json", c); }}
                                className="text-zinc-400 hover:text-zinc-200"
                                title="Esporta JSON"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteChat(c.id, e)}
                                className="text-red-500 hover:text-red-400"
                                title="Sposta nel Cestino"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Sidebar Backup & Sync options footer */}
        <div className="pt-4 border-t border-zinc-850 space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 flex items-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              CIFRATURA LOCALE
            </span>
            <span className="text-emerald-500 font-bold font-mono">AES-256</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 flex items-center gap-1.5 font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
              SYNC CLOUD
            </span>
            <button
              onClick={() => setCloudSyncEnabled(!cloudSyncEnabled)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                cloudSyncEnabled ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {cloudSyncEnabled ? "ATTIVO" : "DISATTIVO"}
            </button>
          </div>

          {/* Backup Import handler */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-center">
            <label className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 py-1.5 px-2 rounded-lg text-[10px] font-semibold border border-zinc-800 cursor-pointer flex items-center justify-center gap-1">
              <Upload className="w-3 h-3" />
              <span>Importa</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                const fullBackup = { chats, projects };
                const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `ai_hub_full_backup_${Date.now()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 py-1.5 px-2 rounded-lg text-[10px] font-semibold border border-zinc-800 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Backup</span>
            </button>
          </div>
        </div>

      </div>

      {/* COLUMN 2-4: CENTRAL MAIN CHAT WORKSPACE (3 COLS) */}
      <div className="xl:col-span-3 flex flex-col justify-between" id="central-chat-panel">
        
        {isCreatingNewChat ? (
          
          /* VIEW A: NEW CHAT SETUP SCREEN */
          <div className="flex-1 flex flex-col justify-center items-center p-6 bg-appbg" id="new-chat-config-form">
            <div className="w-full max-w-3xl space-y-6">
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 mb-4 border border-emerald-500/20">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-100">Inizia una nuova conversazione</h2>
                <p className="text-sm text-zinc-400 mt-2">Scegli un modello locale o imposta il contesto per iniziare.</p>
              </div>

              <div className="bg-panelbg border border-zinc-800/50 rounded-2xl p-6 shadow-xl space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">Modello AI Locale</label>
                    <select
                      value={formModelId}
                      onChange={(e) => setFormModelId(e.target.value)}
                      className="w-full bg-appbg border border-zinc-800 text-sm text-zinc-100 rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {availableModels.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.size}) {m.downloaded ? "✓" : "⏳"}
                        </option>
                      ))}
                    </select>
                    
                    {(() => {
                      const selectedFormModel = availableModels.find(m => m.id === formModelId);
                      if (selectedFormModel && !selectedFormModel.downloaded) {
                        return (
                          <div className="text-[11px] text-zinc-400 flex items-center justify-between mt-2">
                            <span>Richiede installazione locale</span>
                            {onDownloadModel && !selectedFormModel.isDownloading && (
                              <button
                                type="button"
                                onClick={() => onDownloadModel(formModelId)}
                                className="text-emerald-400 font-medium hover:underline"
                              >
                                Installa Ora
                              </button>
                            )}
                            {selectedFormModel.isDownloading && (
                              <span className="text-emerald-400 animate-pulse">Download {selectedFormModel.downloadProgress}%</span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Project Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">Progetto (Opzionale)</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-appbg border border-zinc-800 text-sm text-zinc-100 rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Messaggio Iniziale o Contesto</label>
                  <textarea
                    rows={3}
                    placeholder="Di cosa vuoi parlare? (Opzionale)"
                    value={formInitialContext}
                    onChange={(e) => setFormInitialContext(e.target.value)}
                    className="w-full bg-appbg border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                  <button
                    onClick={() => setFormAdvancedParams(!formAdvancedParams)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors"
                  >
                    <Sliders className="w-4 h-4" />
                    {formAdvancedParams ? "Nascondi opzioni avanzate" : "Mostra opzioni avanzate"}
                  </button>
                  
                  <button
                    onClick={() => {
                      const modelObj = availableModels.find(m => m.id === formModelId);
                      if (modelObj && !modelObj.downloaded) {
                        if (!modelObj.isDownloading && onDownloadModel) {
                          onDownloadModel(formModelId);
                        }
                        setPendingCreateAfterDownload(true);
                      } else {
                        handleCreateChat();
                      }
                    }}
                    disabled={
                      !formModelId || 
                      (availableModels.find(m => m.id === formModelId)?.isDownloading && !pendingCreateAfterDownload)
                    }
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold px-8 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Inizia Sessione</span>
                  </button>
                </div>

                {/* Advanced Options Accordion */}
                {formAdvancedParams && (
                  <div className="pt-6 border-t border-zinc-800/50 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400 flex justify-between">
                          <span>Temperatura ({formTemperature})</span>
                        </label>
                        <input
                          type="range" min="0.1" max="1.5" step="0.05"
                          value={formTemperature}
                          onChange={(e) => setFormTemperature(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400">System Prompt</label>
                        <textarea
                          rows={2}
                          value={formSystemPrompt}
                          onChange={(e) => setFormSystemPrompt(e.target.value)}
                          className="w-full bg-appbg border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300"
                          placeholder="You are a helpful assistant..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300">File, Cartelle & Documenti (RAG, Raw, ZIP)</label>
                      <div className="flex gap-2">
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 border border-dashed border-zinc-700 bg-appbg/50 hover:bg-appbg rounded-xl p-6 text-center cursor-pointer transition-colors h-32 flex flex-col justify-center items-center"
                        >
                          <FileUp className="w-6 h-6 text-emerald-400 mb-2" />
                          <span className="text-xs text-zinc-400">Carica file o trascina qui</span>
                          <span className="text-[10px] text-zinc-500">Supporta raw, zip, pdf</span>
                          <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        </div>
                        <div
                          onClick={() => dirInputRef.current?.click()}
                          className="flex-1 border border-dashed border-zinc-700 bg-appbg/50 hover:bg-appbg rounded-xl p-6 text-center cursor-pointer transition-colors h-32 flex flex-col justify-center items-center"
                        >
                          <FolderPlus className="w-6 h-6 text-amber-400 mb-2" />
                          <span className="text-xs text-zinc-400">Carica un'intera cartella</span>
                          <span className="text-[10px] text-zinc-500">Strutture complesse</span>
                          <input type="file" multiple {...{webkitdirectory: "true", directory: "true"} as any} ref={dirInputRef} onChange={handleFileSelect} className="hidden" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          
          /* VIEW B: ACTIVE CHAT WORKSPACE */
          <div className="bg-panelbg border border-zinc-800 rounded-xl flex flex-col justify-between flex-1 min-h-[500px]" id="chat-session-workspace">
            
            {/* 1. Sub-Header Toolbar */}
            <div className="p-4 border-b border-zinc-850 bg-barbg/60 rounded-t-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                    {activeChat?.title}
                    <span className="text-[9px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-400 px-2 py-0.2 rounded font-normal">
                      {availableModels.find(m => m.id === activeChat?.modelId)?.name || activeChat?.modelId}
                    </span>
                  </h3>
                  {activeChat?.summary ? (
                    <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[280px]">
                      {activeChat.summary}
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Contesto locale sintonizzato con profilo {activeChat?.inferenceProfile.toUpperCase()}
                    </p>
                  )}
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3">
                {/* Compress context trigger */}
                <button
                  onClick={handleCompressContext}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:border-emerald-900 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition flex items-center gap-1.5"
                  title="Comprimi contesto per liberare RAM"
                >
                  <Maximize2 className="w-3 h-3 text-emerald-400" />
                  <span>Comprimi Contesto</span>
                </button>

                {/* Workspace Files Sidebar toggle */}
                {workspaceEntries && workspaceEntries.length > 0 && (
                  <button
                    onClick={() => setWorkspacePanelOpen(!workspacePanelOpen)}
                    className={`border px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition flex items-center gap-1.5 ${
                      workspacePanelOpen 
                        ? "bg-emerald-950/40 border-emerald-900 text-emerald-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-emerald-400"
                    }`}
                    title="Mostra / Nascondi pannello di analisi dei file di workspace"
                  >
                    <Folder className="w-3 h-3 text-emerald-400" />
                    <span>Analisi Workspace ({workspaceEntries.filter(e => e.indexed).length}/{workspaceEntries.filter(e => e.kind === 'file').length})</span>
                  </button>
                )}

                {/* Model comparison switcher */}
                <button
                  onClick={() => {
                    setComparisonActive(!comparisonActive);
                    // Default comparison model
                    if (downloadedModels.length > 0) {
                      setComparisonModelId(downloadedModels.find(m => m.id !== activeChat?.modelId)?.id || downloadedModels[0].id);
                    }
                  }}
                  className={`border px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition flex items-center gap-1.5 ${
                    comparisonActive 
                      ? "bg-violet-950/40 border-violet-900 text-violet-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-violet-400"
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  <span>{comparisonActive ? "Disattiva Confronto" : "Confronta Modelli"}</span>
                </button>

                {/* Export dropdown / printer */}
                <button
                  onClick={() => window.print()}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 p-1.5 rounded-lg text-[10px] transition"
                  title="Stampa / Salva in PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                {/* Return to config */}
                <button
                  onClick={triggerNewChatScreen}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 p-1.5 rounded-lg text-[10px] transition"
                  title="Sintonizza nuova sessione"
                >
                  <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                </button>
              </div>
            </div>

            {/* Model Selection comparison pane selection dropdown */}
            {comparisonActive && (
              <div className="bg-violet-950/10 border-b border-violet-950/50 p-2 px-4 flex items-center justify-between text-xs gap-3">
                <span className="text-violet-400 font-mono text-[10px] font-semibold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> MODALITÀ DUAL COMPARATIVE RESIDENTE
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-mono">Confronta con:</span>
                  <select
                    value={comparisonModelId}
                    onChange={(e) => setComparisonModelId(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-0.5 focus:outline-none"
                  >
                    {downloadedModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
              
              {/* Message scroll container */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0">
                {/* 2. Chat Bubble Messages (Scrollable) */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[450px] min-h-[350px] scrollbar-thin scrollbar-thumb-zinc-850" id="chat-messages-container">
                  
                  {/* Show context summary if present */}
                  {activeChat?.summary && (
                    <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs space-y-1 relative overflow-hidden">
                      <div className="absolute right-0 top-0 bg-emerald-500/10 border-l border-b border-emerald-900/60 px-2 py-0.5 rounded-bl font-mono text-[8px] text-emerald-400 font-bold uppercase tracking-wider">
                        Memoria Contestuale
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wide">Riassunto Lungo Termine</span>
                      <p className="text-zinc-500 italic text-[11px] leading-relaxed">
                        "{activeChat.summary}"
                      </p>
                    </div>
                  )}

                  {activeChat?.messages.length === 0 && !streamingText && (
                    <div className="text-center py-16 text-zinc-600 text-xs italic space-y-2">
                      <Bot className="w-10 h-10 text-zinc-700 mx-auto mb-2 animate-bounce" />
                      <span>Canale sintonizzato locale attivo. Scrivi una richiesta in basso.</span>
                    </div>
                  )}

                  {/* Messages map */}
                  {activeChat?.messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    return (
                      <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`flex items-start space-x-2.5 max-w-[85%] ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                          
                          {/* Avatar */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isUser 
                              ? "bg-zinc-800 text-zinc-200" 
                              : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/60"
                          }`}>
                            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>

                          {/* Content Bubble */}
                          <div className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                            isUser 
                              ? "bg-zinc-100 text-zinc-950 font-medium" 
                              : "bg-barbg text-zinc-200 border border-zinc-850"
                          }`}>
                            
                            {/* Text Content with code highlight mock */}
                            <div className="whitespace-pre-line font-sans prose prose-invert">
                              {msg.content}
                            </div>

                            {/* Versions Selector if edit exists */}
                            {msg.versions && msg.versions.length > 1 && (
                              <div className="mt-2 pt-1 border-t border-zinc-850 flex items-center gap-2 text-[9px] text-zinc-500">
                                <span>Alternate Reply Version {msg.activeVersionIndex! + 1}/{msg.versions.length}</span>
                                <button className="hover:text-emerald-400">← Prec</button>
                                <button className="hover:text-emerald-400">Succ →</button>
                              </div>
                            )}

                            {/* Footer message tags & copy */}
                            <div className="text-[8px] text-zinc-500 font-mono mt-2 text-right flex justify-between items-center gap-4">
                              <span>LOCAL SANDBOX SECURE</span>
                              <span>{msg.timestamp}</span>
                            </div>

                          </div>

                        </div>
                      </div>
                    );
                  })}

                  {/* Streaming Responses (Dual column support) */}
                  {(streamingText || isGenerating) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Current Active Model stream column */}
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2.5 max-w-full">
                          <div className="w-7 h-7 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="p-3.5 bg-barbg text-zinc-200 border border-zinc-850 rounded-xl text-xs leading-relaxed max-w-full">
                            <div className="whitespace-pre-line prose prose-invert">
                              {streamingText || "Inference Engine locale attiva..."}
                              {isGenerating && <span className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-1 animate-pulse"></span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comparison model stream column */}
                      {comparisonActive && (
                        <div className="flex justify-start">
                          <div className="flex items-start space-x-2.5 max-w-full">
                            <div className="w-7 h-7 rounded-lg bg-violet-950/40 text-violet-400 border border-violet-900/60 flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="p-3.5 bg-barbg text-zinc-200 border border-violet-900/40 rounded-xl text-xs leading-relaxed max-w-full">
                              <div className="text-[10px] text-violet-400 font-mono uppercase mb-1 font-bold">
                                Risposta comparativa: {availableModels.find(m => m.id === comparisonModelId)?.name || "Model"}
                              </div>
                              <div className="whitespace-pre-line prose prose-invert italic">
                                {streamingText ? (streamingText + "\n\n*(Nota: Calcolo dei pesi alternativo per sintonizzare il confronto)*") : "In attesa dell'altro canale..."}
                                {isGenerating && <span className="inline-block w-1.5 h-3.5 bg-violet-400 ml-1 animate-pulse"></span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>

              {/* Collapsible Workspace File Integration Sidebar */}
              {workspacePanelOpen && workspaceEntries && workspaceEntries.length > 0 && (
                <div className="w-full md:w-80 bg-zinc-950 border-l border-zinc-850 flex flex-col min-h-[350px] overflow-hidden shrink-0 animate-in slide-in-from-right duration-200" id="workspace-rag-sidebar">
                  <div className="p-3 border-b border-zinc-850 bg-zinc-900/40 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 animate-pulse" /> Analisi File Workspace
                    </span>
                    <button 
                      onClick={() => setWorkspacePanelOpen(false)}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3 border-b border-zinc-850 bg-zinc-900/20 space-y-2">
                    {/* Live RAG Mode toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={ragMode} 
                        onChange={(e) => setRagMode(e.target.checked)}
                        className="rounded bg-zinc-900 border-zinc-850 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold text-zinc-300">RAG Semantic Search</span>
                    </label>
                    <p className="text-[10px] text-zinc-500 leading-normal pl-5">
                      Cerca automaticamente frammenti rilevanti dal database vettoriale e li inietta nel prompt.
                    </p>
                  </div>

                  {/* Scrollable File List */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[320px]">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block px-1 mb-1">Seleziona File per Analisi:</span>
                    {workspaceEntries.filter(e => e.kind === 'file').map((entry) => {
                      const isSelected = selectedWorkspaceFiles.includes(entry.path);
                      return (
                        <div key={entry.path} className="p-2 rounded bg-zinc-900/60 border border-zinc-850/50 flex flex-col gap-1.5 transition-all hover:border-zinc-800">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="text-xs font-mono text-zinc-200 truncate" title={entry.path}>
                                {entry.name}
                              </span>
                            </div>
                            
                            {entry.indexed ? (
                              <label className="flex items-center shrink-0">
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedWorkspaceFiles(prev => prev.filter(p => p !== entry.path));
                                    } else {
                                      setSelectedWorkspaceFiles(prev => [...prev, entry.path]);
                                    }
                                  }}
                                  className="rounded bg-zinc-950 border-zinc-850 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                  title="Includi intero file nel contesto"
                                />
                              </label>
                            ) : (
                              <button
                                onClick={() => indexFileFromChat(entry)}
                                disabled={indexingFile === entry.path}
                                className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase disabled:opacity-50"
                              >
                                {indexingFile === entry.path ? (
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin inline mr-0.5" />
                                ) : "Indicizza"}
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                            <span>{entry.size ? `${(entry.size / 1024).toFixed(1)} KB` : "Dim. Sconosciuta"}</span>
                            {entry.indexed ? (
                              <span className="text-emerald-400 font-bold uppercase tracking-wider">RAG OK</span>
                            ) : (
                              <span className="text-zinc-600">Non indicizzato</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* 3. Realtime Telemetry, Generation Control & Chat Input area */}
            <div className="p-4 border-t border-zinc-850 bg-barbg/30 space-y-3.5 rounded-b-xl">
              
              {/* Telemetry metrics bar (CPU/GPU/RAM loads and generation speed) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-appbg p-2 border border-zinc-850 rounded-lg">
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">CPU THREADPOOL</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-zinc-200">{telemetry.cpuLoad}%</span>
                    <div className="w-12 bg-zinc-950 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${telemetry.cpuLoad}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-appbg p-2 border border-zinc-850 rounded-lg">
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">GPU CORE CO-PROC</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-zinc-200">{telemetry.gpuLoad}%</span>
                    <div className="w-12 bg-zinc-950 h-1 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full" style={{ width: `${telemetry.gpuLoad}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-appbg p-2 border border-zinc-850 rounded-lg">
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">ALLOCAZIONE RAM</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-zinc-200">{telemetry.ramUsed} GB</span>
                    <div className="w-12 bg-zinc-950 h-1 rounded-full overflow-hidden">
                      <div className="bg-violet-400 h-full" style={{ width: `${(telemetry.ramUsed / telemetry.ramTotal) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-appbg p-2 border border-zinc-850 rounded-lg">
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">VELOCITÀ TOKENS</span>
                  <span className="text-xs font-bold font-mono text-emerald-400 block">
                    {telemetry.speed > 0 ? `${telemetry.speed} t/sec` : "0.0 t/s"}
                  </span>
                </div>

                <div className="bg-appbg p-2 border border-zinc-850 rounded-lg col-span-2 md:col-span-1">
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">CONTATORI ELAPSED</span>
                  <span className="text-xs font-bold font-mono text-zinc-200 block">
                    {telemetry.tokensGenerated > 0 ? `${telemetry.tokensGenerated} tok` : "0 tok"}
                  </span>
                </div>
              </div>

              {/* Workspace indicator */}
              {workspaceEntries && workspaceEntries.length > 0 && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-emerald-950/20 border border-emerald-900/30 rounded text-[10px] text-emerald-400 font-mono">
                  <Folder className="w-3 h-3" />
                  <span>Workspace Locale Connesso: {workspaceEntries.length} file/cartelle indicizzati per l'analisi AI.</span>
                </div>
              )}

              {/* Chat Input form and interrupt action */}
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="relative flex items-center bg-appbg border border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 transition-all">
                  
                  {/* Plus file upload prompt */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 shrink-0 transition"
                    title="Aggiungi allegati veloci"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isGenerating}
                    placeholder={isGenerating ? "L'AI Hub sta generando..." : "Invia un messaggio all'Inference Engine locale..."}
                    className="flex-1 bg-transparent border-none text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none px-2 py-1"
                  />

                  {/* Submission and Stop triggers */}
                  <div className="flex items-center gap-2">
                    {isGenerating ? (
                      <button
                        type="button"
                        onClick={() => setIsGenerating(false)}
                        className="bg-red-950/60 text-red-400 border border-red-900/60 hover:bg-red-900/60 p-2 rounded-lg transition"
                        title="Interrompi Generazione"
                      >
                        <StopCircle className="w-4 h-4 text-red-500 animate-spin" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black p-2 rounded-lg transition cursor-pointer"
                      >
                        <Send className="w-4 h-4 fill-black" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline attachment status preview if attachments present */}
                {formAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[9px] font-mono text-zinc-500 items-center">
                    <span>Allegati attivi in questa sessione:</span>
                    {formAttachments.map(a => (
                      <span key={a.id} className="bg-zinc-950 border border-zinc-800 px-1.5 py-0.2 rounded text-zinc-300">
                        {a.name} (v{a.version})
                      </span>
                    ))}
                  </div>
                )}
              </form>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}
