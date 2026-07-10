# 08_Professional_Chat_Evidence

## Modulo: Professional Chat

* **File coinvolti**: 
  - `/src/components/ProfessionalChat.tsx`
  - `/src/apiClient.ts`
* **Metodi coinvolti**: 
  - `chatAPI(message, history, systemInstruction, modelId)`

### Flusso di Esecuzione
1. L'utente seleziona il modello e inserisce un messaggio testuale nel pannello della chat.
2. Se sono presenti allegati, la UI invia i file al server per l'upload fisco e ne inietta il testo estratto direttamente all'interno dei prompt di contesto.
3. `chatAPI` acquisisce le chiavi API configurate localmente dagli header dell'utente (`x-gemini-key`, `x-openrouter-key`, ecc.).
4. Mappa l'ID astratto del modello con l'identificativo esatto del provider esterno.
5. Invia una chiamata `fetch` diretta al provider selezionato (OpenAI, Anthropic, Groq, OpenRouter) o esegue il failover sull'endpoint primario di Google Gemini (`generativelanguage.googleapis.com`).
6. La risposta viene gestita sul client in formato streaming se abilitato o visualizzata dinamicamente convertendo il Markdown tramite il componente `react-markdown`.

### Stato Reale dell'Implementazione
* **Stato**: **IMPLEMENTATO**
* **Evidenza**: L'architettura client-side di instradamento, gestione della cronologia, formattazione in Markdown e integrazione dei file di contesto è completamente reale e interconnessa con le API di inferenza cloud ed endpoints di runtime locali esterni.
