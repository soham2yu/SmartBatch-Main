import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import { openai } from "./replit_integrations/image"; // we will use this for text models too
import { parse } from "csv-parse/sync";

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.datasets.list.path, async (req, res) => {
    const datasets = await storage.getDatasets();
    res.json(datasets);
  });

  app.post(api.datasets.upload.path, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // We need a dummy user id since we don't have real auth yet, just to link datasets
      const dataset = await storage.createDataset({
        userId: 1, // dummy user
        filename: req.file.originalname,
        status: "processing"
      });

      // Parse CSV
      const records = parse(req.file.buffer, {
        columns: true,
        skip_empty_lines: true
      });

      const batchData = records.map((record: any) => {
        // Calculate a simple mock score for MVP
        const energy = parseFloat(record.energy || "0");
        const carbon = parseFloat(record.carbon || "0");
        const yieldRate = parseFloat(record['yield rate'] || record.yieldRate || record.yield || "0");
        const temp = parseFloat(record.temperature || "0");
        const speed = parseFloat(record['machine speed'] || record.machineSpeed || "0");
        
        // Mock scoring: high yield, low energy/carbon is better
        const score = (yieldRate * 100) / ((energy + carbon + 1));
        
        // Mock anomaly detection: just random for MVP
        const isAnomaly = Math.random() < 0.05;

        return {
          datasetId: dataset.id,
          batchIdString: record.batch_id || record.batchId || Math.random().toString(36).substring(7),
          energy,
          carbon,
          yieldRate,
          temperature: temp,
          machineSpeed: speed,
          timestamp: new Date(record.timestamp || Date.now()),
          score,
          isAnomaly
        };
      });

      await storage.insertBatches(batchData);
      
      // Calculate a dummy recommendation
      await storage.createRecommendation({
        datasetId: dataset.id,
        recommendedTemp: 75.5,
        recommendedSpeed: 120.0,
        energyReduction: 15.2,
        carbonReduction: 8.5,
        yieldImprovement: 4.3
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
    const batches = await storage.getBatches(datasetId);
    res.json(batches);
  });

  app.get(api.batches.goldenBatch.path, async (req, res) => {
    const datasetId = parseInt(req.params.datasetId);
    if (isNaN(datasetId)) return res.status(400).json({ message: "Invalid dataset ID" });
    const golden = await storage.getGoldenBatch(datasetId);
    res.json(golden || null);
  });

  app.get(api.recommendations.get.path, async (req, res) => {
    const datasetId = parseInt(req.params.datasetId);
    if (isNaN(datasetId)) return res.status(400).json({ message: "Invalid dataset ID" });
    const rec = await storage.getRecommendation(datasetId);
    res.json(rec || null);
  });

  app.get(api.predictions.forecast.path, async (req, res) => {
    const datasetId = parseInt(req.params.datasetId);
    if (isNaN(datasetId)) return res.status(400).json({ message: "Invalid dataset ID" });
    
    // Generate dummy forecast
    const forecast = Array.from({length: 10}).map((_, i) => ({
      batchIdString: `F-${Math.floor(Math.random()*1000)}`,
      predictedYield: 90 + Math.random() * 5 - 2.5
    }));
    
    res.json(forecast);
  });

  app.post(api.predictions.simulate.path, async (req, res) => {
    try {
      const input = api.predictions.simulate.input.parse(req.body);
      // Simple mock simulation
      const predictedYield = 85 + (input.temperature * 0.1) - (input.machineSpeed * 0.05);
      res.json({ predictedYield: Math.min(100, Math.max(0, predictedYield)) });
    } catch (e) {
      res.status(400).json({ message: "Invalid simulation parameters" });
    }
  });

  app.post(api.copilot.query.path, async (req, res) => {
    try {
      const { query, datasetId } = api.copilot.query.input.parse(req.body);
      
      let context = "You are SmartBatch AI, an industrial manufacturing assistant.";
      if (datasetId) {
         context += " The user is viewing a dataset and asking questions about their manufacturing batches, yields, and energy consumption.";
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: context },
          { role: "user", content: query }
        ]
      });

      res.json({ response: response.choices[0]?.message?.content || "I couldn't process that query." });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error querying copilot" });
    }
  });

  return httpServer;
}
