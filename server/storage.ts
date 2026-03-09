import {
  users, datasets, batches, recommendations,
  type User, type InsertUser,
  type Dataset, type InsertDataset,
  type Batch, type InsertBatch,
  type Recommendation, type InsertRecommendation
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getDatasets(): Promise<Dataset[]>;
  getDataset(id: number): Promise<Dataset | undefined>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  updateDatasetStatus(id: number, status: string): Promise<Dataset>;

  getBatches(datasetId: number): Promise<Batch[]>;
  getGoldenBatch(datasetId: number): Promise<Batch | undefined>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  insertBatches(batches: InsertBatch[]): Promise<void>;

  getRecommendation(datasetId: number): Promise<Recommendation | undefined>;
  createRecommendation(rec: InsertRecommendation): Promise<Recommendation>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getDatasets(): Promise<Dataset[]> {
    return db.select().from(datasets).orderBy(desc(datasets.uploadedAt));
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    const [dataset] = await db.select().from(datasets).where(eq(datasets.id, id));
    return dataset || undefined;
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const [newDataset] = await db.insert(datasets).values(dataset).returning();
    return newDataset;
  }

  async updateDatasetStatus(id: number, status: string): Promise<Dataset> {
    const [updated] = await db.update(datasets).set({ status }).where(eq(datasets.id, id)).returning();
    return updated;
  }

  async getBatches(datasetId: number): Promise<Batch[]> {
    return db.select().from(batches).where(eq(batches.datasetId, datasetId)).orderBy(asc(batches.timestamp));
  }

  async getGoldenBatch(datasetId: number): Promise<Batch | undefined> {
    const [golden] = await db.select()
      .from(batches)
      .where(eq(batches.datasetId, datasetId))
      .orderBy(desc(batches.score))
      .limit(1);
    return golden || undefined;
  }

  async createBatch(batch: InsertBatch): Promise<Batch> {
    const [newBatch] = await db.insert(batches).values(batch).returning();
    return newBatch;
  }

  async insertBatches(batchData: InsertBatch[]): Promise<void> {
    // For large datasets, might need chunking, but for MVP we assume reasonable size
    if (batchData.length > 0) {
      await db.insert(batches).values(batchData);
    }
  }

  async getRecommendation(datasetId: number): Promise<Recommendation | undefined> {
    const [rec] = await db.select().from(recommendations).where(eq(recommendations.datasetId, datasetId));
    return rec || undefined;
  }

  async createRecommendation(rec: InsertRecommendation): Promise<Recommendation> {
    const [newRec] = await db.insert(recommendations).values(rec).returning();
    return newRec;
  }
}

export const storage = new DatabaseStorage();
