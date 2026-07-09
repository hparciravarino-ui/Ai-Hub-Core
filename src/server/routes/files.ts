import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

export const filesRouter = Router();

const UPLOADS_DIR = path.join(process.cwd(), "workspace_uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB limit for large files
});

filesRouter.post("/upload", upload.array("files"), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const uploadedFiles: any[] = [];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Nessun file caricato." });
    }

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      let extractedFiles = [];

      // Auto-extract ZIP files
      if (ext === ".zip") {
        try {
          const zip = new AdmZip(file.path);
          const extractDir = path.join(UPLOADS_DIR, `extracted_${Date.now()}`);
          zip.extractAllTo(extractDir, true);
          
          const entries = zip.getEntries();
          entries.forEach(entry => {
            if (!entry.isDirectory) {
              extractedFiles.push({
                name: entry.entryName,
                size: entry.header.size,
                path: path.join(extractDir, entry.entryName)
              });
            }
          });
          
          // Optionally delete the original zip file
          // fs.unlinkSync(file.path);
          
          uploadedFiles.push({
            name: file.originalname,
            type: "zip",
            extracted: extractedFiles
          });
        } catch (zipError) {
          console.error("ZIP Extraction Error:", zipError);
          uploadedFiles.push({
            name: file.originalname,
            error: "Impossibile estrarre lo ZIP."
          });
        }
      } else {
        uploadedFiles.push({
          name: file.originalname,
          size: file.size,
          path: file.path,
          type: "file"
        });
      }
    }

    res.json({ success: true, files: uploadedFiles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

filesRouter.get("/list", (req, res) => {
  try {
    // Basic flat listing of files in UPLOADS_DIR
    const files = fs.readdirSync(UPLOADS_DIR);
    const fileStats = files.map(f => {
      const p = path.join(UPLOADS_DIR, f);
      const stat = fs.statSync(p);
      return {
        name: f,
        isDirectory: stat.isDirectory(),
        size: stat.size,
        modified: stat.mtime
      };
    });
    res.json({ files: fileStats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
