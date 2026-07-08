export class ResultAnalyzer {
  public static analyze(result: any) {
    const analysis: string[] = [];
    if (result.status === 'failed') {
      analysis.push(`Benchmark fallito: ${result.error || 'Errore sconosciuto'}`);
      return analysis;
    }

    if (result.metrics.tokensPerSecond < 10) {
      analysis.push('Velocità critica: Meno di 10 token al secondo. L\'esperienza utente potrebbe essere compromessa.');
    } else if (result.metrics.tokensPerSecond > 40) {
      analysis.push('Prestazioni eccellenti: Il modello genera testo molto velocemente.');
    }

    if (result.metrics.ramPeak > 85) {
      analysis.push('Collo di bottiglia RAM: L\'utilizzo della memoria ha superato l\'85%. Rischio di swap.');
    }

    if (result.metrics.cpuPeak > 90) {
      analysis.push('Colli di bottiglia CPU: Utilizzo intenso del processore.');
    }

    return analysis;
  }
}
