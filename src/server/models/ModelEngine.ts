import { HardwareEngine } from '../../shared/hardware/HardwareEngine';
import { ModelSearch } from './ModelSearch';
import { ScoringEngine } from './ScoringEngine';
import { ConfigurationEngine } from './ConfigurationEngine';
import { BenchmarkPredictor } from './BenchmarkPredictor';
import { RecommendationEngine } from './RecommendationEngine';

export class ModelEngine {
  public static async evaluateModels() {
    // 1. Get real hardware
    const hardware = await HardwareEngine.scan();

    // 2. Fetch models dynamically
    const rawModels = await ModelSearch.fetchModels();

    // 3. Score & Check Compatibility
    const scoredModels = ScoringEngine.scoreModels(rawModels, hardware);

    // 4. Generate Auto-Configurations and Benchmarks
    const fullyEvaluated = scoredModels.map(m => {
      const config = ConfigurationEngine.generate(m, hardware);
      const benchmark = BenchmarkPredictor.predict(m, config, hardware);
      return {
        ...m,
        autoConfig: config,
        benchmark
      };
    });

    // 5. Generate Recommendations
    const recommendations = RecommendationEngine.getRecommendations(fullyEvaluated);

    return {
      hardwareProfile: {
        cpu: hardware.cpu.model,
        ram: Math.round(hardware.ram.total / (1024 * 1024 * 1024)) + 'GB',
        gpu: hardware.gpu.controllers[0]?.model || 'None',
        vram: (hardware.gpu.controllers[0]?.vram || 0) + 'MB',
        aiAccelerators: hardware.aiHardware.join(', ') || 'None'
      },
      recommendations,
      models: fullyEvaluated.sort((a, b) => b.scores.overall - a.scores.overall)
    };
  }
}
