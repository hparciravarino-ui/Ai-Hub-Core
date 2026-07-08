export class RecommendationEngine {
  public static generateRecommendations(result: any) {
    const recs: string[] = [];
    if (result.metrics.ramPeak > 90) {
      recs.push('RAM insufficiente: Considera di liberare memoria o aggiungere RAM.');
    }
    if (result.metrics.tempPeak > 85) {
      recs.push('Configurazione non ottimale: Temperature troppo elevate, migliorare dissipazione.');
    }
    if (result.status === 'failed') {
      recs.push('Verifica che il runtime (Native o llama.cpp) sia in esecuzione.');
      recs.push('Controlla che il modello sia stato scaricato correttamente.');
      return recs;
    }

    if (result.metrics.ramPeak > 85) {
      recs.push('Utilizza una versione con quantizzazione maggiore (es. q4_k_m invece di q8_0) per ridurre l\'uso di RAM.');
      recs.push('Chiudi le altre applicazioni durante l\'uso del modello.');
    }

    if (result.metrics.cpuPeak > 90 && result.provider === 'native') {
      recs.push('Se hai una GPU, assicurati che Native stia rilevando i driver corretti (CUDA/Metal).');
    }

    if (result.metrics.tokensPerSecond < 10) {
      recs.push('Riduci la Context Window per velocizzare la generazione dei token.');
    }

    if (recs.length === 0) {
      recs.push('Configurazione ottimale per questo hardware. Nessuna modifica richiesta.');
    }

    return recs;
  }
}
