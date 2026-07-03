import { ModelCapabilityRegistry } from "./ModelCapabilityRegistry";
import { PromptNormalizer, OutputNormalizer } from "./PromptNormalizer";
import { UniversalTokenManager } from "./UniversalTokenManager";
import { CapabilityRequest, NormalizedOutput, ModelCapabilityProfile } from "./types";
import { Logger } from "../../core/logging/Logger";
import { ModelCompatibilityMatrix } from "./CompatibilityMatrix";
import { RuntimeAdapter, LlamaCppAdapter, ONNXAdapter, ModelAdapter, LlamaAdapter, PhiAdapter } from "./adapters";

export class UMAL {
    private static instance: UMAL;
    public registry: ModelCapabilityRegistry;
    public promptNormalizer: PromptNormalizer;
    public outputNormalizer: OutputNormalizer;
    public tokenManager: UniversalTokenManager;
    public compatibilityMatrix: ModelCompatibilityMatrix;
    private logger = Logger.getInstance();

    private runtimeAdapters: Map<string, RuntimeAdapter> = new Map();
    private modelAdapters: Map<string, ModelAdapter> = new Map();

    private constructor() {
        this.registry = new ModelCapabilityRegistry();
        this.promptNormalizer = new PromptNormalizer();
        this.outputNormalizer = new OutputNormalizer();
        this.tokenManager = new UniversalTokenManager();
        this.compatibilityMatrix = new ModelCompatibilityMatrix();
        
        this.registerAdapters();
        this.bootstrapDefaultModels();
    }

    public static getInstance(): UMAL {
        if (!UMAL.instance) {
            UMAL.instance = new UMAL();
        }
        return UMAL.instance;
    }

    private registerAdapters() {
        const llamaCpp = new LlamaCppAdapter();
        const onnx = new ONNXAdapter();
        this.runtimeAdapters.set(llamaCpp.id, llamaCpp);
        this.runtimeAdapters.set(onnx.id, onnx);

        const llamaAdapter = new LlamaAdapter();
        const phiAdapter = new PhiAdapter();
        this.modelAdapters.set(llamaAdapter.family, llamaAdapter);
        this.modelAdapters.set(phiAdapter.family, phiAdapter);
    }

    private bootstrapDefaultModels() {
        // Pre-register some mock models to simulate 8.17 Auto Capability Discovery
        this.registry.registerModel({
            id: "model-llama-3-8b-instruct",
            name: "Llama-3-8B-Instruct",
            family: "Llama 3",
            version: "8B",
            license: "Llama 3 License",
            format: "GGUF",
            quantization: "Q4_K_M",
            sizeMb: 4800,
            supportedLanguages: ["en", "it", "es", "fr", "de"],
            maxContextTokens: 8192,
            capabilities: ["Text Generation", "Reasoning", "Code", "Instruction Following" as any, "Tool Calling", "JSON Mode", "Streaming"],
            performance: {
                reasoningScore: 82, codingScore: 78, visionScore: 0, ocrScore: 0, speechScore: 0,
                translationScore: 80, creativityScore: 75, speedTokensPerSec: 65, accuracyScore: 85,
                toolCallingScore: 88, longContextScore: 70, structuredOutputScore: 90, planningScore: 75, automationScore: 80
            },
            hardwareRequirements: { ramMb: 6000, vramMb: 0 },
            status: "Ready"
        });

        this.registry.registerModel({
            id: "model-phi-3-mini",
            name: "Phi-3-Mini-4k",
            family: "Phi",
            version: "3",
            license: "MIT",
            format: "ONNX",
            quantization: "FP16",
            sizeMb: 3800,
            supportedLanguages: ["en"],
            maxContextTokens: 4096,
            capabilities: ["Text Generation", "Reasoning", "Code", "Fast Inference" as any, "Streaming"],
            performance: {
                reasoningScore: 78, codingScore: 80, visionScore: 0, ocrScore: 0, speechScore: 0,
                translationScore: 65, creativityScore: 70, speedTokensPerSec: 90, accuracyScore: 80,
                toolCallingScore: 75, longContextScore: 60, structuredOutputScore: 80, planningScore: 70, automationScore: 75
            },
            hardwareRequirements: { ramMb: 4000, vramMb: 0 },
            status: "Ready"
        });

        this.registry.registerModel({
            id: "model-llava-1.5",
            name: "LLaVA-1.5-7b",
            family: "LLaVA",
            version: "1.5",
            license: "Apache 2.0",
            format: "GGUF",
            quantization: "Q5_K_M",
            sizeMb: 5200,
            supportedLanguages: ["en"],
            maxContextTokens: 4096,
            capabilities: ["Text Generation", "Vision", "OCR", "Multimodality"],
            performance: {
                reasoningScore: 75, codingScore: 60, visionScore: 90, ocrScore: 85, speechScore: 0,
                translationScore: 70, creativityScore: 70, speedTokensPerSec: 45, accuracyScore: 75,
                toolCallingScore: 60, longContextScore: 65, structuredOutputScore: 70, planningScore: 65, automationScore: 60
            },
            hardwareRequirements: { ramMb: 7000, vramMb: 0 },
            status: "Ready"
        });
    }

    /**
     * Execute inference through UMAL.
     * 8.11 Capability Negotiation Engine
     * 8.12 Intelligent Fallback
     */
    public async execute(prompt: string, requirements: CapabilityRequest): Promise<NormalizedOutput> {
        this.logger.debug(`[UMAL] Execution requested. Required Capabilities: [${requirements.requiredCapabilities.join(", ")}]`);

        const t0 = performance.now();

        // 8.6 Routing
        let model = this.registry.findBestModel(requirements);

        if (!model) {
            throw new Error(`[UMAL] Impossible to fulfill request. No model provides required capabilities: ${requirements.requiredCapabilities.join(", ")}`);
        }

        // 8.14 Compatibility Check before execution
        const hardwareAvailable = { ramMb: 8000, vramMb: 4000 }; // Simulated available hardware
        // For simulation, assume we pick the first available runtime that supports the model format
        const runtime = Array.from(this.runtimeAdapters.values()).find(r => r.supportedFormats.includes(model!.format));
        
        if (runtime) {
             const compResult = this.compatibilityMatrix.checkCompatibility(
                 model.format, 
                 model.quantization, 
                 runtime.supportedFormats, 
                 hardwareAvailable, 
                 model.hardwareRequirements
             );
             if (!compResult.isCompatible) {
                 this.logger.warn(`[UMAL] Compatibility check failed for ${model.name}. Reason: ${compResult.issues.join(", ")}`);
             }
        }

        // 8.9 Prompt Normalization
        let normalizedPrompt = this.promptNormalizer.normalize(prompt);

        // 8.8 Model Adapter (apply template)
        let formattedPrompt = normalizedPrompt;
        const modelAdapter = this.modelAdapters.get(model.family);
        if (modelAdapter) {
            formattedPrompt = modelAdapter.applyTemplate(normalizedPrompt);
        }

        // Simulation of actual runtime inference with Intelligent Fallback (8.12)
        let rawOutput: any = null;
        let selectedModelId = model.id;
        
        try {
            // Attempt inference (8.7 Runtime Adapter)
            if (runtime) {
                rawOutput = await runtime.executeInference(model.id, formattedPrompt, normalizedPrompt.contextParams);
            } else {
                rawOutput = await this.simulateRuntimeExecution(model, formattedPrompt);
            }
        } catch (e: any) {
            this.logger.warn(`[UMAL Fallback] Model ${model.name} failed: ${e.message}. Attempting Intelligent Fallback...`);
            
            // 8.12 Fallback Strategy sequence:
            this.logger.info(`[UMAL Fallback] Fallback Sequence: Quantization -> Runtime -> Model -> Hardware -> CPU`);
            
            const fallbackModel = this.registry.getAllModels().find(m => 
                m.id !== model!.id && 
                m.status === "Ready" && 
                requirements.requiredCapabilities.every(c => m.capabilities.includes(c))
            );

            if (fallbackModel) {
                this.logger.info(`[UMAL Fallback] Selected fallback model: ${fallbackModel.name}`);
                selectedModelId = fallbackModel.id;
                rawOutput = await this.simulateRuntimeExecution(fallbackModel, normalizedPrompt);
            } else {
                this.logger.error(`[UMAL Fatal] Notifica utente: Fallback fallito.`);
                throw new Error(`[UMAL Fatal] Inference failed and no fallback models available for capabilities: ${requirements.requiredCapabilities.join(", ")}`);
            }
        }

        const t1 = performance.now();

        // 8.10 Output Normalization
        if (modelAdapter) {
            rawOutput = modelAdapter.parseOutput(rawOutput);
        }
        const output = this.outputNormalizer.normalize(rawOutput, selectedModelId, parseFloat((t1 - t0).toFixed(2)));
        
        return output;
    }

    private async simulateRuntimeExecution(model: ModelCapabilityProfile, prompt: any): Promise<any> {
        // Simulated network/processing latency based on model speed
        const latency = 1000 / (model.performance.speedTokensPerSec / 10);
        await new Promise(res => setTimeout(res, Math.min(latency, 200)));

        return {
            text: `[Risposta generata da ${model.name} utilizzando astrazione UMAL]\nLa tua richiesta era stata elaborata con successo, considerando le capacità di: ${model.capabilities.slice(0, 3).join(", ")}.`,
            usage: {
                promptTokens: 25,
                completionTokens: 40,
                totalTokens: 65
            }
        };
    }
}
