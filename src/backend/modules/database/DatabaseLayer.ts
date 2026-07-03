import { Logger } from "../../core/logger/Logger";
import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

export class DatabaseLayer {
    private logger: Logger;
    private isConnected: boolean = false;
    private sqlite!: Database.Database;
    public db!: BetterSQLite3Database<typeof schema>;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public async connect(): Promise<void> {
        this.logger.info("[Database Layer] Connecting to local SQLite database...");
        try {
            const dbDir = path.join(process.cwd(), 'data');
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            const dbPath = path.join(dbDir, 'aihub.db');
            
            this.sqlite = new Database(dbPath);
            this.db = drizzle(this.sqlite, { schema });
            
            // For a robust system, we would run migrations here.
            // Since we don't have drizzle-kit migrations set up yet, 
            // we will create tables manually for the initial schema.
            this.sqlite.exec(`
                CREATE TABLE IF NOT EXISTS chats (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    created_time TEXT NOT NULL,
                    last_modified TEXT NOT NULL,
                    model_id TEXT NOT NULL,
                    inference_profile TEXT NOT NULL,
                    message_count INTEGER NOT NULL DEFAULT 0,
                    total_tokens INTEGER NOT NULL DEFAULT 0,
                    total_processing_time INTEGER NOT NULL DEFAULT 0,
                    category TEXT NOT NULL,
                    project_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    summary TEXT,
                    tags TEXT NOT NULL,
                    parameters TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    chat_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
            `);

            this.isConnected = true;
            this.logger.info(`[Database Layer] Connected successfully. Database at ${dbPath}`);
        } catch (error: any) {
            this.logger.error(`[Database Layer] Connection failed: ${error.message}`);
            throw error;
        }
    }

    public getStatus(): object {
        return {
            connected: this.isConnected,
            type: "sqlite (better-sqlite3)",
            status: this.isConnected ? "active" : "offline"
        };
    }
}
