# 11_Dependency_Verification

## Matrice e Grafo delle Dipendenze Reali

Questo documento mappa visivamente e analiticamente le connessioni e i canali di comunicazione attivi tra i diversi layer della piattaforma.

## Grafo Strutturale delle Dipendenze

```
[main.tsx]
    │
    ▼
[App.tsx] (Gestione Navigazione & Layout Tab)
    │
    ├──► [Sidebar.tsx] (Barra di Navigazione)
    │
    └──► [AppContent.tsx] (Router di Presentazione)
            │
            ├──► [ProfessionalChat.tsx] ────► [apiClient.ts] ──► [HTTP LLM Provider APIs]
            │
            ├──► [SystemDashboard.tsx] ─────► [GET /api/hardware/metrics]
            │
            ├──► [RAGDashboard.tsx] ────────► [POST /api/files/upload]
            │
            └──► [InstallationSetupCenter] ─► [GET /api/setup/diagnostics]
```

## Canale di Comunicazione Backend-Frontend
1. **Frontend**: Effettua chiamate HTTP asincrone strutturate verso la porta `3000` utilizzando fetch.
2. **Express Backend**: Smista le richieste tramite `app.use("/api", apiRouter)` verso i singoli router dedicati.
3. **Hardware OS Layer**: Il router invoca il wrapper `HardwareEngine` che interroga la libreria `systeminformation` la quale lancia chiamate di sistema reali verso il kernel Linux o macOS per estrarre le statistiche hardware dell'host.
