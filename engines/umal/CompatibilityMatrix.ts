import { Logger } from "../../core/logging/Logger";

export interface CompatibilityCheckResult {
    isCompatible: boolean;
    issues: string[];
}

export class ModelCompatibilityMatrix {
    private logger = Logger.getInstance();

    /**
     * 8.14 Model Compatibility Matrix
     * Verifica la compatibilità tra modello, formato, quantizzazione, runtime e hardware.
     */
    public checkCompatibility(
        modelFormat: string, 
        quantization: string, 
        runtimeSupportedFormats: string[], 
        hardwareAvailable: { vramMb: number, ramMb: number },
        modelRequirements: { vramMb: number, ramMb: number }
    ): CompatibilityCheckResult {
        const issues: string[] = [];

        // Verifica Formato vs Runtime
        if (!runtimeSupportedFormats.includes(modelFormat)) {
            issues.push(`Il formato ${modelFormat} non è supportato dal runtime corrente.`);
        }

        // Verifica Memoria RAM
        if (hardwareAvailable.ramMb < modelRequirements.ramMb) {
            issues.push(`RAM insufficiente. Richiesti: ${modelRequirements.ramMb} MB, Disponibili: ${hardwareAvailable.ramMb} MB.`);
        }

        // Verifica VRAM (se richiesta)
        if (modelRequirements.vramMb > 0 && hardwareAvailable.vramMb < modelRequirements.vramMb) {
            issues.push(`VRAM insufficiente. Richiesti: ${modelRequirements.vramMb} MB, Disponibili: ${hardwareAvailable.vramMb} MB.`);
        }

        const isCompatible = issues.length === 0;

        if (!isCompatible) {
            this.logger.warn(`[CompatibilityMatrix] Incompatibilità rilevate: ${issues.join(", ")}`);
        } else {
            this.logger.debug(`[CompatibilityMatrix] Compatibilità verificata con successo per formato ${modelFormat}.`);
        }

        return {
            isCompatible,
            issues
        };
    }
}
