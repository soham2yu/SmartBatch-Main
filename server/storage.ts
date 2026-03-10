import {
  users, datasets, batches, recommendations,
  type User, type InsertUser,
  type Dataset, type InsertDataset,
  type Batch, type InsertBatch,
  type Recommendation, type InsertRecommendation
} from "@shared/schema";
import { db, isDatabaseConfigured } from "./db";
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
    const [user] = await db!.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db!.insert(users).values(insertUser).returning();
    return user;
  }

  async getDatasets(): Promise<Dataset[]> {
    return db!.select().from(datasets).orderBy(desc(datasets.uploadedAt));
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    const [dataset] = await db!.select().from(datasets).where(eq(datasets.id, id));
    return dataset || undefined;
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const [newDataset] = await db!.insert(datasets).values(dataset).returning();
    return newDataset;
  }

  async updateDatasetStatus(id: number, status: string): Promise<Dataset> {
    const [updated] = await db!.update(datasets).set({ status }).where(eq(datasets.id, id)).returning();
    return updated;
  }

  async getBatches(datasetId: number): Promise<Batch[]> {
    return db!
      .select()
      .from(batches)
      .where(eq(batches.datasetId, datasetId))
      .orderBy(asc(batches.timestamp));
  }

  async getGoldenBatch(datasetId: number): Promise<Batch | undefined> {
    const [golden] = await db!
      .select()
      .from(batches)
      .where(eq(batches.datasetId, datasetId))
      .orderBy(desc(batches.score))
      .limit(1);
    return golden || undefined;
  }

  async createBatch(batch: InsertBatch): Promise<Batch> {
    const [newBatch] = await db!.insert(batches).values(batch).returning();
    return newBatch;
  }

  async insertBatches(batchData: InsertBatch[]): Promise<void> {
    if (batchData.length > 0) {
      await db!.insert(batches).values(batchData);
    }
  }

  async getRecommendation(datasetId: number): Promise<Recommendation | undefined> {
    const [rec] = await db!
      .select()
      .from(recommendations)
      .where(eq(recommendations.datasetId, datasetId));
    return rec || undefined;
  }

  async createRecommendation(rec: InsertRecommendation): Promise<Recommendation> {
    const [newRec] = await db!.insert(recommendations).values(rec).returning();
    return newRec;
  }
}

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private datasets: Dataset[] = [];
  private batches: Batch[] = [];
  private recommendations: Recommendation[] = [];

  private userId = 1;
  private datasetId = 1;
  private batchId = 1;
  private recommendationId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const created: User = { id: this.userId++, ...insertUser };
    this.users.push(created);
    return created;
  }

  async getDatasets(): Promise<Dataset[]> {
    return [...this.datasets].sort((a, b) => {
      const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    return this.datasets.find((dataset) => dataset.id === id);
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const created: Dataset = {
      id: this.datasetId++,
      uploadedAt: new Date(),
      status: dataset.status ?? "processing",
      ...dataset,
    };
    this.datasets.push(created);
    return created;
  }

  async updateDatasetStatus(id: number, status: string): Promise<Dataset> {
    const dataset = this.datasets.find((d) => d.id === id);
    if (!dataset) {
      throw new Error(`Dataset ${id} not found`);
    }
    dataset.status = status;
    return dataset;
  }

  async getBatches(datasetId: number): Promise<Batch[]> {
    return this.batches
      .filter((batch) => batch.datasetId === datasetId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getGoldenBatch(datasetId: number): Promise<Batch | undefined> {
    return this.batches
      .filter((batch) => batch.datasetId === datasetId)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  }

  async createBatch(batch: InsertBatch): Promise<Batch> {
    const created: Batch = {
      id: this.batchId++,
      ...batch,
      score: batch.score ?? null,
      isAnomaly: batch.isAnomaly ?? null,
    };
    this.batches.push(created);
    return created;
  }

  async insertBatches(batchData: InsertBatch[]): Promise<void> {
    for (const batch of batchData) {
      this.batches.push({
        id: this.batchId++,
        ...batch,
        score: batch.score ?? null,
        isAnomaly: batch.isAnomaly ?? null,
      });
    }
  }

  async getRecommendation(datasetId: number): Promise<Recommendation | undefined> {
    return this.recommendations.find((recommendation) => recommendation.datasetId === datasetId);
  }

  async createRecommendation(rec: InsertRecommendation): Promise<Recommendation> {
    const created: Recommendation = { id: this.recommendationId++, ...rec };
    this.recommendations.push(created);
    return created;
  }
}

export const storage: IStorage = isDatabaseConfigured ? new DatabaseStorage() : new MemoryStorage();
