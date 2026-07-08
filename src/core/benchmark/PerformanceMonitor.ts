import { MetricsCollector } from './MetricsCollector';

export class PerformanceMonitor {
  private static interval: any = null;

  public static startMonitoring(callback: (metrics: any) => void, intervalMs: number = 1500) {
    this.interval = setInterval(async () => {
      const metrics = await MetricsCollector.collectCurrentMetrics();
      callback(metrics);
    }, intervalMs);
  }

  public static stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
