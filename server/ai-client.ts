type AIBatchInput = {
  batch_id: string;
  energy: number;
  carbon: number;
  yield_rate: number;
  temperature: number;
  machine_speed: number;
};

type AnalyzeResponse = {
  batches: Array<{ batch_id: string; score: number; is_anomaly: boolean }>;
  golden_batch: {
    batch_id: string;
    energy: number;
    carbon: number;
    yield_rate: number;
    temperature: number;
    machine_speed: number;
    score: number;
  };
  recommendations: {
    recommended_temperature: number;
    recommended_machine_speed: number;
    energy_reduction_potential: number;
    carbon_reduction_potential: number;
    yield_improvement: number;
  };
};

const PYTHON_API_BASE = process.env.PYTHON_API_URL || "http://127.0.0.1:8000/api";

async function postJson<TResponse>(path: string, payload: unknown): Promise<TResponse> {
  const response = await fetch(`${PYTHON_API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Python API ${path} failed (${response.status}): ${body}`);
  }

  return (await response.json()) as TResponse;
}

function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) {
    return values.map(() => 0);
  }
  return values.map((v) => (v - min) / (max - min));
}

// Fallback keeps the app functional if Python service is temporarily unavailable.
function localAnalyzeFallback(batches: AIBatchInput[]): AnalyzeResponse {
  const energies = batches.map((b) => b.energy);
  const carbons = batches.map((b) => b.carbon);
  const yields = batches.map((b) => b.yield_rate);

  const energyNorm = normalize(energies);
  const carbonNorm = normalize(carbons);
  const yieldNorm = normalize(yields);

  const avgEnergy = energies.reduce((a, b) => a + b, 0) / Math.max(1, energies.length);
  const avgCarbon = carbons.reduce((a, b) => a + b, 0) / Math.max(1, carbons.length);
  const avgYield = yields.reduce((a, b) => a + b, 0) / Math.max(1, yields.length);

  const energyStd = Math.sqrt(
    energies.reduce((sum, v) => sum + (v - avgEnergy) ** 2, 0) / Math.max(1, energies.length)
  );
  const carbonStd = Math.sqrt(
    carbons.reduce((sum, v) => sum + (v - avgCarbon) ** 2, 0) / Math.max(1, carbons.length)
  );

  const batchesWithScore = batches.map((batch, index) => {
    const score = yieldNorm[index] * 0.5 - energyNorm[index] * 0.3 - carbonNorm[index] * 0.2;
    const isAnomaly = batch.energy > avgEnergy + 2 * energyStd || batch.carbon > avgCarbon + 2 * carbonStd;
    return { batch, score, isAnomaly };
  });

  const golden = [...batchesWithScore].sort((a, b) => b.score - a.score)[0] ?? batchesWithScore[0];

  return {
    batches: batchesWithScore.map((row) => ({
      batch_id: row.batch.batch_id,
      score: Number(row.score.toFixed(4)),
      is_anomaly: row.isAnomaly,
    })),
    golden_batch: {
      batch_id: golden.batch.batch_id,
      energy: golden.batch.energy,
      carbon: golden.batch.carbon,
      yield_rate: golden.batch.yield_rate,
      temperature: golden.batch.temperature,
      machine_speed: golden.batch.machine_speed,
      score: Number(golden.score.toFixed(4)),
    },
    recommendations: {
      recommended_temperature: Number(golden.batch.temperature.toFixed(2)),
      recommended_machine_speed: Number(golden.batch.machine_speed.toFixed(2)),
      energy_reduction_potential: avgEnergy === 0 ? 0 : Number((((avgEnergy - golden.batch.energy) / avgEnergy) * 100).toFixed(2)),
      carbon_reduction_potential: avgCarbon === 0 ? 0 : Number((((avgCarbon - golden.batch.carbon) / avgCarbon) * 100).toFixed(2)),
      yield_improvement: avgYield === 0 ? 0 : Number((((golden.batch.yield_rate - avgYield) / avgYield) * 100).toFixed(2)),
    },
  };
}

export async function analyzeBatchesWithAI(batches: AIBatchInput[]): Promise<AnalyzeResponse> {
  try {
    return await postJson<AnalyzeResponse>("/ai/analyze", { batches });
  } catch (error) {
    console.warn("Python analyze endpoint unavailable, using local fallback:", error);
    return localAnalyzeFallback(batches);
  }
}

export async function forecastWithAI(
  batches: AIBatchInput[],
  steps = 10
): Promise<Array<{ future_batch: number; predicted_yield: number }>> {
  try {
    return await postJson<Array<{ future_batch: number; predicted_yield: number }>>("/ai/forecast", {
      batches,
      steps,
    });
  } catch (error) {
    console.warn("Python forecast endpoint unavailable, using local fallback:", error);
    if (batches.length === 0) {
      return [];
    }
    const meanYield = batches.reduce((sum, b) => sum + b.yield_rate, 0) / batches.length;
    return Array.from({ length: steps }, (_, index) => ({
      future_batch: index + 1,
      predicted_yield: Number(meanYield.toFixed(2)),
    }));
  }
}

export async function simulateWithAI(input: {
  energy: number;
  carbon: number;
  temperature: number;
  machine_speed: number;
}): Promise<{ predicted_yield: number }> {
  try {
    return await postJson<{ predicted_yield: number }>("/ai/simulate", input);
  } catch (error) {
    console.warn("Python simulate endpoint unavailable, using local fallback:", error);
    const predicted = 125 - 0.07 * input.energy - 0.35 * input.carbon + 0.42 * input.temperature - 0.015 * input.machine_speed;
    return { predicted_yield: Math.max(0, Math.min(100, Number(predicted.toFixed(2)))) };
  }
}

export async function copilotWithAI(payload: {
  question: string;
  batches: AIBatchInput[];
}): Promise<{ response: string }> {
  try {
    return await postJson<{ response: string }>("/ai/copilot", payload);
  } catch (error) {
    console.warn("Python copilot endpoint unavailable, using local fallback:", error);
    const count = payload.batches.length;
    const avgYield =
      count > 0 ? payload.batches.reduce((sum, batch) => sum + batch.yield_rate, 0) / count : 0;
    return {
      response: `Python AI service is unavailable. Dataset has ${count} batches with average yield ${avgYield.toFixed(
        2
      )}%.`,
    };
  }
}
