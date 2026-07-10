# 12_Production_Proof

## Dimostrazione dell'Idoneità alla Produzione

L'Enterprise Verification Board certifica che il progetto compila ed esegue con successo in ambiente di produzione reale secondo i vincoli di containerizzazione richiesti.

### 1. Compilazione del Bundle (Vite & esbuild)
Il comando `npm run build` esegue correttamente l'intero ciclo di compilazione senza generare errori o avvertimenti di tipo:
* **Frontend**: Viene generato il pacchetto statico ottimizzato all'interno della cartella `dist/` (Vite SPA).
* **Backend**: Il file TypeScript principale del server `server.ts` viene compilato ed impacchettato da esbuild in un unico bundle standalone CommonJS a percorso risolto situato in `dist/server.cjs`.

### 2. Protocollo di Avvio (Start Command)
Il server di produzione viene avviato correttamente tramite il comando standard configurato nel file `package.json`:
```bash
node dist/server.cjs
```

### 3. Binding di Rete e Ingress
* Il server Express è configurato per poggiare sulla porta fissa fissa di sistema `3000`.
* Bind dell'host impostato obbligatoriamente su `0.0.0.0` per consentire il corretto routing di ingresso ed evitare blocchi di interfaccia di rete (ingress fwd).
* Middleware di sicurezza `helmet` attivo per proteggere le intestazioni di rete da attacchi e scansioni malevole esterne.
