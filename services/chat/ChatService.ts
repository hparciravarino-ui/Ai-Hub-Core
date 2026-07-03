import { Logger } from "../../core/logging/Logger";
import { AppError, ErrorSeverity } from "../../core/lifecycle/ErrorHandler";
import { DatabaseLayer } from "../../database/sqlite/DatabaseLayer";
import { chats, messages } from "../../database/sqlite/schema";
import { eq, desc } from "drizzle-orm";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  versions?: string[];
  activeVersionIndex?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdTime: string;
  lastModified: string;
  modelId: string;
  inferenceProfile: string;
  messageCount: number;
  totalTokens: number;
  totalProcessingTime: number;
  tags: string[];
  category: string;
  projectId: string;
  status: "active" | "archived" | "favorite" | "locked" | "trash";
  messages: ChatMessage[];
  parameters: {
    temperature: number;
    topP: number;
    topK: number;
    contextWindow: number;
    maxTokens: number;
    systemPrompt: string;
    initialContext: string;
    language: string;
  };
  summary?: string;
}

export class ChatService {
  private logger: Logger;
  private isInitialized: boolean = false;
  private dbLayer!: DatabaseLayer;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public async initialize(dbLayer?: DatabaseLayer): Promise<void> {
    this.logger.info("Initializing ChatService...");
    if (dbLayer) {
      this.dbLayer = dbLayer;
    } else {
      throw new AppError("DatabaseLayer not provided to ChatService", ErrorSeverity.HIGH);
    }
    this.isInitialized = true;
    this.logger.info("ChatService initialized.");
  }

  public getStatus() {
    return {
      status: this.isInitialized ? "online" : "offline",
      chatsCount: this.isInitialized ? this.getAllChats().length : 0
    };
  }

  public createChat(chat: Omit<ChatSession, "id">): ChatSession {
    if (!this.isInitialized) throw new AppError("ChatService offline", ErrorSeverity.HIGH);
    
    const id = "chat_" + Math.random().toString(36).substr(2, 9);
    const newChat: ChatSession = { ...chat, id };
    
    try {
      this.dbLayer.db.insert(chats).values({
        id: newChat.id,
        title: newChat.title,
        createdTime: newChat.createdTime,
        lastModified: newChat.lastModified,
        modelId: newChat.modelId,
        inferenceProfile: newChat.inferenceProfile,
        messageCount: newChat.messageCount,
        totalTokens: newChat.totalTokens,
        totalProcessingTime: newChat.totalProcessingTime,
        category: newChat.category,
        projectId: newChat.projectId,
        status: newChat.status,
        summary: newChat.summary,
        tags: JSON.stringify(newChat.tags || []),
        parameters: JSON.stringify(newChat.parameters || {})
      }).run();

      for (const msg of newChat.messages) {
        this.dbLayer.db.insert(messages).values({
          id: msg.id,
          chatId: newChat.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }).run();
      }
      this.logger.debug(`Created chat: ${id}`);
    } catch (e: any) {
      this.logger.error(`Error creating chat: ${e.message}`);
      throw new AppError("Failed to create chat in DB", ErrorSeverity.MEDIUM);
    }

    return newChat;
  }

  public getChat(id: string): ChatSession | undefined {
    if (!this.isInitialized) return undefined;
    
    try {
      const chatRecord = this.dbLayer.db.select().from(chats).where(eq(chats.id, id)).get();
      if (!chatRecord) return undefined;

      const msgs = this.dbLayer.db.select().from(messages).where(eq(messages.chatId, id)).all();

      return {
        id: chatRecord.id,
        title: chatRecord.title,
        createdTime: chatRecord.createdTime,
        lastModified: chatRecord.lastModified,
        modelId: chatRecord.modelId,
        inferenceProfile: chatRecord.inferenceProfile,
        messageCount: chatRecord.messageCount,
        totalTokens: chatRecord.totalTokens,
        totalProcessingTime: chatRecord.totalProcessingTime,
        category: chatRecord.category,
        projectId: chatRecord.projectId,
        status: chatRecord.status as any,
        summary: chatRecord.summary || undefined,
        tags: JSON.parse(chatRecord.tags),
        parameters: JSON.parse(chatRecord.parameters),
        messages: msgs.map(m => ({
          id: m.id,
          role: m.role as any,
          content: m.content,
          timestamp: m.timestamp
        }))
      };
    } catch (e) {
      this.logger.error("Failed to fetch chat");
      return undefined;
    }
  }

  public updateChat(id: string, updates: Partial<ChatSession>): ChatSession {
    if (!this.isInitialized) throw new AppError("ChatService offline", ErrorSeverity.HIGH);

    const existingChat = this.getChat(id);
    if (!existingChat) {
      throw new AppError(`Chat ${id} not found`, ErrorSeverity.MEDIUM);
    }
    
    const updated = { ...existingChat, ...updates, lastModified: new Date().toLocaleString() };
    
    try {
      this.dbLayer.db.update(chats).set({
        title: updated.title,
        lastModified: updated.lastModified,
        modelId: updated.modelId,
        inferenceProfile: updated.inferenceProfile,
        messageCount: updated.messageCount,
        totalTokens: updated.totalTokens,
        totalProcessingTime: updated.totalProcessingTime,
        category: updated.category,
        projectId: updated.projectId,
        status: updated.status,
        summary: updated.summary,
        tags: JSON.stringify(updated.tags),
        parameters: JSON.stringify(updated.parameters)
      }).where(eq(chats.id, id)).run();

      this.dbLayer.db.delete(messages).where(eq(messages.chatId, id)).run();
      
      for (const msg of updated.messages) {
        this.dbLayer.db.insert(messages).values({
          id: msg.id,
          chatId: updated.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }).run();
      }

    } catch (e: any) {
      this.logger.error("Error updating chat: " + e.message);
    }

    return updated;
  }

  public deleteChat(id: string): void {
    if (!this.isInitialized) throw new AppError("ChatService offline", ErrorSeverity.HIGH);
    
    try {
      this.dbLayer.db.delete(chats).where(eq(chats.id, id)).run();
      this.logger.debug(`Deleted chat: ${id}`);
    } catch (e) {
      throw new AppError(`Failed to delete chat ${id}`, ErrorSeverity.MEDIUM);
    }
  }

  public syncAllChats(chatList: ChatSession[]): void {
    if (!this.isInitialized) throw new AppError("ChatService offline", ErrorSeverity.HIGH);
    
    try {
      this.dbLayer.db.delete(messages).run();
      this.dbLayer.db.delete(chats).run();

      for (const newChat of chatList) {
        this.createChat(newChat);
      }
      this.logger.debug(`Synced ${chatList.length} chats`);
    } catch (e) {
      this.logger.error("Error syncing chats");
    }
  }

  public getAllChats(): ChatSession[] {
    if (!this.isInitialized) return [];

    try {
      const allChats = this.dbLayer.db.select().from(chats).orderBy(desc(chats.lastModified)).all();
      
      return allChats.map(chatRecord => {
        const msgs = this.dbLayer.db.select().from(messages).where(eq(messages.chatId, chatRecord.id)).all();
        return {
          id: chatRecord.id,
          title: chatRecord.title,
          createdTime: chatRecord.createdTime,
          lastModified: chatRecord.lastModified,
          modelId: chatRecord.modelId,
          inferenceProfile: chatRecord.inferenceProfile,
          messageCount: chatRecord.messageCount,
          totalTokens: chatRecord.totalTokens,
          totalProcessingTime: chatRecord.totalProcessingTime,
          category: chatRecord.category,
          projectId: chatRecord.projectId,
          status: chatRecord.status as any,
          summary: chatRecord.summary || undefined,
          tags: JSON.parse(chatRecord.tags),
          parameters: JSON.parse(chatRecord.parameters),
          messages: msgs.map(m => ({
            id: m.id,
            role: m.role as any,
            content: m.content,
            timestamp: m.timestamp
          }))
        };
      });
    } catch (e) {
      this.logger.error("Failed to get all chats");
      return [];
    }
  }
}
