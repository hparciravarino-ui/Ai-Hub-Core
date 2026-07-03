export type AICapability =
    | "Text Generation"
    | "Reasoning"
    | "Vision"
    | "Speech"
    | "Embedding"
    | "Code"
    | "Planning"
    | "OCR"
    | "Translation"
    | "Summarization"
    | "Tool Calling"
    | "Function Calling"
    | "RAG"
    | "Agents"
    | "Long Context"
    | "Structured Output"
    | "JSON Mode"
    | "Streaming"
    | "Thinking Mode"
    | "Multimodality";

export interface ModelCapabilityProfile {
    id: string;
    name: string;
    family: string;
    version: string;
    license: string;
    format: string; // e.g., GGUF, Safetensors
    quantization: string; // e.g., Q4_K_M
    sizeMb: number;
    supportedLanguages: string[];
    maxContextTokens: number;
    capabilities: AICapability[];
    
    // Performance metrics updated by Capability Benchmark (8.13)
    performance: {
        reasoningScore: number;
        codingScore: number;
        visionScore: number;
        ocrScore: number;
        speechScore: number;
        translationScore: number;
        creativityScore: number;
        speedTokensPerSec: number;
        accuracyScore: number;
        toolCallingScore: number;
        longContextScore: number;
        structuredOutputScore: number;
        planningScore: number;
        automationScore: number;
    };

    hardwareRequirements: {
        ramMb: number;
        vramMb: number;
    };
    
    status: ModelLifecycleState;
}

export type ModelLifecycleState =
    | "Downloaded"
    | "Verified"
    | "Indexed"
    | "Benchmarked"
    | "Ready"
    | "Loaded"
    | "Running"
    | "Paused"
    | "Unloaded"
    | "Archived"
    | "Removed";

export interface NormalizedPrompt {
    systemPrompt: string;
    messages: { role: "user" | "assistant" | "system", content: string }[];
    tools?: any[];
    format?: "text" | "json";
    contextParams: {
        maxTokens: number;
        temperature: number;
        topP: number;
    };
}

export interface NormalizedOutput {
    format: "text" | "json" | "markdown" | "code" | "embedding" | "image" | "audio" | "tool_call" | "metadata" | "reasoning_log";
    content: any;
    tokensUsed: {
        prompt: number;
        completion: number;
        total: number;
    };
    latencyMs: number;
    modelId: string;
    reasoningLog?: string;
}

export interface CapabilityRequest {
    requiredCapabilities: AICapability[];
    preferredCapabilities?: AICapability[];
    minSpeedTokensPerSec?: number;
    minAccuracyScore?: number;
    maxVramMb?: number;
}
