import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  status: text("status").default("processing"), // processing, completed, failed
});

export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").notNull(),
  batchIdString: text("batch_id_string").notNull(),
  energy: doublePrecision("energy").notNull(),
  carbon: doublePrecision("carbon").notNull(),
  yieldRate: doublePrecision("yield_rate").notNull(),
  machineSpeed: doublePrecision("machine_speed").notNull(),
  temperature: doublePrecision("temperature").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  score: doublePrecision("score"),
  isAnomaly: boolean("is_anomaly").default(false),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").notNull(),
  recommendedTemp: doublePrecision("recommended_temp").notNull(),
  recommendedSpeed: doublePrecision("recommended_speed").notNull(),
  energyReduction: doublePrecision("energy_reduction").notNull(),
  carbonReduction: doublePrecision("carbon_reduction").notNull(),
  yieldImprovement: doublePrecision("yield_improvement").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertDatasetSchema = createInsertSchema(datasets).omit({ id: true, uploadedAt: true });
export const insertBatchSchema = createInsertSchema(batches).omit({ id: true });
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;

export type Batch = typeof batches.$inferSelect;
export type InsertBatch = z.infer<typeof insertBatchSchema>;

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
