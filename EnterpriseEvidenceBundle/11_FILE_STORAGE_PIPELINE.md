# File Storage Pipeline

## Workspace
* Path: `workspace_uploads/`
* Upload: Tramite `multer` in `src/server/routes/files.ts`.
* Estrazione: `adm-zip` per gli archivi.
* Indicizzazione: I file testuali vengono letti (`fs.readFileSync`) e il testo restituito alla UI.
* Limiti: JSON limitato a 50MB (Express middleware limit).
