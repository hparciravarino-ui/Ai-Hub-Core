import { HardwareEngine } from '../../shared/hardware/HardwareEngine';
import { MetricsEngine } from '../../shared/hardware/MetricsEngine';
import { BenchmarkDatabase } from './BenchmarkDatabase';

export class BenchmarkRunner {
  public static async runBenchmark(modelId: string, modelName: string, provider: 'native' | 'llamacpp') {
    const startTime = Date.now();
    let timeToFirstToken = 0;
    let tokensPerSecond = 0;
    let totalTime = 0;
    let success = false;
    let errorMsg = null;

    // We will measure hardware utilization before and after
    const initialMetrics = await MetricsEngine.getLiveMetrics();

    try {
      if (provider === 'native') {
        const reqStart = Date.now();
        // Mock native engine processing
        await new Promise(resolve => setTimeout(resolve, 800));
        const data: any = {
          load_duration: 150000000,
          eval_duration: 650000000,
          eval_count: 50
        };
        const reqEnd = Date.now();
        
        totalTime = reqEnd - reqStart;
        // Estimate TTFT since non-streaming
        timeToFirstToken = data.load_duration ? data.load_duration / 1e6 : (totalTime * 0.3);
        const evalDurationMs = data.eval_duration ? data.eval_duration / 1e6 : totalTime;
        const tokensCount = data.eval_count || 50;
        
        tokensPerSecond = (tokensCount / (evalDurationMs / 1000)) || 0;
        success = true;

      } else if (provider === 'llamacpp') {
        const reqStart = Date.now();
        // Mock llamacpp engine processing
        await new Promise(resolve => setTimeout(resolve, 600));
        const data: any = {
          timings: {
            prompt_eval_ms: 120,
            predicted_per_second: 30
          }
        };
        const reqEnd = Date.now();

        totalTime = reqEnd - reqStart;
        const timings = data.timings || {};
        timeToFirstToken = timings.prompt_eval_ms || (totalTime * 0.3);
        tokensPerSecond = timings.predicted_per_second || 0;
        success = true;
      }
    } catch (err: any) {
      errorMsg = err.message;
      success = false;
    }

    const finalMetrics = await MetricsEngine.getLiveMetrics();
    const hardware = await HardwareEngine.scan();

    const result = {
      modelId,
      modelName,
      provider,
      status: success ? 'completed' : 'failed',
      error: errorMsg,
      metrics: {
        timeToFirstTokenMs: Math.round(timeToFirstToken),
        tokensPerSecond: Number(tokensPerSecond.toFixed(2)),
        totalTimeMs: totalTime,
        cpuPeak: Math.max(initialMetrics.cpu, finalMetrics.cpu),
        ramPeak: Math.max(initialMetrics.ram, finalMetrics.ram),
        tempPeak: Math.max(initialMetrics.temp, finalMetrics.temp)
      },
      hardware: {
        cpu: hardware.cpu.model,
        ram: hardware.ram.total,
        os: hardware.os.distro
      }
    };

    await BenchmarkDatabase.saveResult(result);
    return result;
  }
}
