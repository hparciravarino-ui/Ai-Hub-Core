import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdTime: text('created_time').notNull(),
  lastModified: text('last_modified').notNull(),
  modelId: text('model_id').notNull(),
  inferenceProfile: text('inference_profile').notNull(),
  messageCount: integer('message_count').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  totalProcessingTime: integer('total_processing_time').notNull().default(0),
  category: text('category').notNull(),
  projectId: text('project_id').notNull(),
  status: text('status').notNull(), // active, archived, etc
  summary: text('summary'),
  tags: text('tags').notNull(),
  parameters: text('parameters').notNull(),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // user, assistant, system
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull(),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});
