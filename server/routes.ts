import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import multer from "multer";
import { parse } from "csv-parse/sync";
import crypto from "crypto";
import {
  analyzeBatchesWithAI,
  forecastWithAI,
  simulateWithAI,
  copilotWithAI,
} from "./ai-client";

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

function toNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function firstDefined(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") {
      return record[key];
    }
  }
  return undefined;
}

function firstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  const value = firstDefined(record, keys);
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedPassword: string): boolean {
  const [salt, storedHash] = storedPassword.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");
  if (storedBuffer.length !== hashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, hashBuffer);
}

function getSessionUserId(req: any): number | null {
  return typeof req.session?.userId === "number" ? req.session.userId : null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const requireOwnedDataset = async (req: any, res: any, datasetId: number) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return null;
    }

    const dataset = await storage.getDataset(datasetId);
    if (!dataset || dataset.userId !== userId) {
      res.status(404).json({ message: "Dataset not found" });
      return null;
    }

    return dataset;
  };

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByEmail(input.email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const createdUser = await storage.createUser({
        email: input.email.toLowerCase(),
        password: hashPassword(input.password),
      });

      req.session.userId = createdUser.id;
      return res.status(201).json({ id: createdUser.id, email: createdUser.email });
    } catch (error) {
      return res.status(400).json({ message: "Invalid registration input" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email.toLowerCase());
      if (!user || !verifyPassword(input.password, user.password)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      return res.json({ id: user.id, email: user.email });
    } catch (error) {
      return res.status(400).json({ message: "Invalid login input" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("smartbatch.sid");
      return res.json({ success: true });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({ id: user.id, email: user.email });
  });

  app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/auth")) {
      return next();
    }

    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
  });

  app.get(api.datasets.list.path, async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const allDatasets = await storage.getDatasets();
    const datasets = allDatasets.filter((dataset) => dataset.userId === userId);
    res.json(datasets);
  });

  app.post(api.datasets.upload.path, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const dataset = await storage.createDataset({
        userId,
        filename: req.file.originalname,
        status: "processing"
      });

      // Parse CSV
      const records = parse(req.file.buffer, {
        columns: true,
        skip_empty_lines: true
      });

      if (!Array.isArray(records) || records.length === 0) {
        await storage.updateDatasetStatus(dataset.id, "failed");
        return res.status(400).json({ message: "Uploaded CSV is empty or invalid." });
      }

      const aiInput = records.map((record: any, index: number) => ({
        batch_id:
          firstString(record, ["batch_id", "batchId", "batchid"]) ||
          `BATCH-${String(index + 1).padStart(4, "0")}`,
        energy: toNumber(firstDefined(record, ["energy", "Energy"])),
        carbon: toNumber(firstDefined(record, ["carbon", "Carbon", "co2", "CO2"])),
        yield_rate: toNumber(
          firstDefined(record, ["yield_rate", "yield rate", "yieldRate", "yield"])
        ),
        temperature: toNumber(firstDefined(record, ["temperature", "temp", "Temperature"])),
        machine_speed: toNumber(
          firstDefined(record, ["machine_speed", "machine speed", "machineSpeed", "speed"])
        ),
      }));

      const analysis = await analyzeBatchesWithAI(aiInput);
      const aiByBatchId = new Map(
        analysis.batches.map((batch) => [batch.batch_id, batch])
      );

      const batchData = records.map((record: any, index: number) => {
        const batchIdString =
          firstString(record, ["batch_id", "batchId", "batchid"]) ||
          `BATCH-${String(index + 1).padStart(4, "0")}`;
        const energy = toNumber(firstDefined(record, ["energy", "Energy"]));
        const carbon = toNumber(firstDefined(record, ["carbon", "Carbon", "co2", "CO2"]));
        const yieldRate = toNumber(
          firstDefined(record, ["yield_rate", "yield rate", "yieldRate", "yield"])
        );
        const temp = toNumber(firstDefined(record, ["temperature", "temp", "Temperature"]));
        const speed = toNumber(
          firstDefined(record, ["machine_speed", "machine speed", "machineSpeed", "speed"])
        );
        const aiResult = aiByBatchId.get(batchIdString);

        return {
          datasetId: dataset.id,
          batchIdString,
          energy,
          carbon,
          yieldRate,
          temperature: temp,
          machineSpeed: speed,
          timestamp: new Date(record.timestamp || Date.now()),
          score: aiResult?.score ?? null,
          isAnomaly: aiResult?.is_anomaly ?? false,
        };
      });

      await storage.insertBatches(batchData);

      await storage.createRecommendation({
        datasetId: dataset.id,
        recommendedTemp: analysis.recommendations.recommended_temperature,
        recommendedSpeed: analysis.recommendations.recommended_machine_speed,
        energyReduction: analysis.recommendations.energy_reduction_potential,
        carbonReduction: analysis.recommendations.carbon_reduction_potential,
        yieldImprovement: analysis.recommendations.yield_improvement,
      });

      await storage.updateDatasetStatus(dataset.id, "completed");

      const completedDataset = await storage.getDataset(dataset.id);
      res.status(201).json(completedDataset);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error during processing" });
    }
  });

  app.get(api.batches.list.path, async (req, res) => {
    const datasetId = parseInt(req.params.datasetId);
    if (isNaN(datasetId)) return res.status(400).json({ message: "Invalid dataset ID" });
    const dataset = await requireOwnedDataset(req, res, datasetId);
    if (!dataset) return;
    const batches = await storage.getBatches(datasetId);
    res.json(batches);
  });

  app.get(api.batches.goldenBatch.path, async (req, res) => {
    const datasetId = parseInt(req.params.datasetId);
    if (isNaN(datasetId)) return res.status(400).json({ message: "Invalid dataset ID" });
    const dataset = await requireOwnedDataset(req, res, datasetId);
    if (!dataset) return;
    const golden = await storage.getGoldenBatch(datasetId);
    res.json(golden || null);
  });

  app.get(api.recommendations.get.path, async (req, res) => {
    const datasetId = parseInt(req.params.datasetId);
    if (isNaN(datasetId)) return res.status(400).json({ message: "Invalid dataset ID" });
    const dataset = await requireOwnedDataset(req, res, datasetId);
    if (!dataset) return;
    const rec = await storage.getRecommendation(datasetId);
    res.json(rec || null);
  });

  app.get(api.predictions.forecast.path, async (req, res) => {
    const datasetId = parseInt(req.params.datasetId);
    if (isNaN(datasetId)) return res.status(400).json({ message: "Invalid dataset ID" });
    const dataset = await requireOwnedDataset(req, res, datasetId);
    if (!dataset) return;

    const batches = await storage.getBatches(datasetId);
    if (batches.length === 0) {
      return res.json([]);
    }

    const aiInput = batches.map((batch) => ({
      batch_id: batch.batchIdString,
      energy: batch.energy,
      carbon: batch.carbon,
      yield_rate: batch.yieldRate,
      temperature: batch.temperature,
      machine_speed: batch.machineSpeed,
    }));

    const forecast = await forecastWithAI(aiInput, 10);
    const response = forecast.map((point) => ({
      batchIdString: `F-${point.future_batch}`,
      predictedYield: Number(point.predicted_yield.toFixed(2)),
    }));

    res.json(response);
  });

  app.post(api.predictions.simulate.path, async (req, res) => {
    try {
      const input = api.predictions.simulate.input.parse(req.body);

      const simulation = await simulateWithAI({
        energy: input.energy,
        carbon: input.carbon,
        temperature: input.temperature,
        machine_speed: input.machineSpeed,
      });

      res.json({ predictedYield: simulation.predicted_yield });
    } catch (e) {
      res.status(400).json({ message: "Invalid simulation parameters" });
    }
  });

  app.post(api.copilot.query.path, async (req, res) => {
    try {
      const { query, datasetId } = api.copilot.query.input.parse(req.body);

      if (!datasetId) {
        return res.json({
          response:
            "Please select a dataset first so I can answer with production-specific insights.",
        });
      }

      const dataset = await requireOwnedDataset(req, res, datasetId);
      if (!dataset) return;

      const batches = await storage.getBatches(datasetId);
      if (batches.length === 0) {
        return res.json({
          response:
            "No batches found for this dataset yet. Upload telemetry data to unlock AI insights.",
        });
      }

      const aiPayload = {
        question: query,
        batches: batches.map((batch) => ({
          batch_id: batch.batchIdString,
          energy: batch.energy,
          carbon: batch.carbon,
          yield_rate: batch.yieldRate,
          temperature: batch.temperature,
          machine_speed: batch.machineSpeed,
        })),
      };

      const copilot = await copilotWithAI(aiPayload);
      res.json({ response: copilot.response });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error querying copilot" });
    }
  });

  return httpServer;
}
