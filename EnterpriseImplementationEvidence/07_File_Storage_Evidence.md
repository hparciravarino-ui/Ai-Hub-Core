# 07_File_Storage_Evidence

## Modulo: File & Storage Engine

* **File coinvolti**: 
  - `/src/server/routes/files.ts`
  - `/src/components/FileManager.tsx`
* **API coinvolte**: 
  - `POST /api/files/upload`
  - `GET /api/files/list`

### Flusso di Esecuzione
1. L'utente carica uno o più file tramite drag-and-drop o esploratore risorse.
2. I file vengono inviati tramite richiesta Multipart Form a `/api/files/upload`.
3. Il middleware `multer` intercetta i file e li salva fisicamente all'interno della cartella di lavoro `workspace_uploads/`.
4. Se il file caricato ha estensione `.zip`, il server istanzia la classe `AdmZip` per decomprimerlo ricorsivamente ed estrarne i file contenuti in una cartella temporanea locale.
5. `/api/files/list` scansiona ricorsivamente la cartella `workspace_uploads/` usando `fs.readdirSync` e raccoglie la dimensione e la data dell'ultima modifica di ciascun file tramite `fs.statSync`.

### Stato Reale dell'Implementazione
* **Stato**: **IMPLEMENTATO**
* **Evidenza**: L'intera catena di elaborazione, upload, scompattamento degli archivi ZIP e scansione dei metadati dei file sul disco è reale e priva di simulazioni. Supporta file di grandi dimensioni fino a 500MB (limite impostato in multer alla linea 25) ed esegue l'elaborazione fisica degli archivi sul disco fisso dell'host.
