export interface RuntimeAdapter {
    id: string;
    name: string;
    supportedFormats: string[];
    supportedHardware: string[];
    
    initialize(config: any): Promise<void>;
    executeInference(modelPath: string, prompt: any, contextParams: any): Promise<any>;
    terminate(): Promise<void>;
}

export class LlamaCppAdapter implements RuntimeAdapter {
    id = "runtime-llama-cpp";
    name = "LLAMA Adapter";
    supportedFormats = ["GGUF"];
    supportedHardware = ["CPU", "CUDA", "Metal"];

    async initialize(config: any): Promise<void> {}
    
    async executeInference(modelPath: string, prompt: any, contextParams: any): Promise<any> {
        return { text: "Simulated output from Llama.cpp", usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 }};
    }
    
    async terminate(): Promise<void> {}
}

export class ONNXAdapter implements RuntimeAdapter {
    id = "runtime-onnx";
    name = "ONNX Adapter";
    supportedFormats = ["ONNX"];
    supportedHardware = ["CPU", "CUDA", "DirectML", "TensorRT"];

    async initialize(config: any): Promise<void> {}
    
    async executeInference(modelPath: string, prompt: any, contextParams: any): Promise<any> {
        return { text: "Simulated output from ONNX Runtime", usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 }};
    }
    
    async terminate(): Promise<void> {}
}
