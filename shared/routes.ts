import { z } from "zod";
import { datasets, batches, recommendations } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  datasets: {
    list: {
      method: 'GET' as const,
      path: '/api/datasets' as const,
      responses: {
        200: z.array(z.custom<typeof datasets.$inferSelect>()),
      }
    },
    upload: {
      method: 'POST' as const,
      path: '/api/datasets/upload' as const,
      // Uses FormData, so no JSON input schema
      responses: {
        201: z.custom<typeof datasets.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      }
    },
  },
  batches: {
    list: {
      method: 'GET' as const,
      path: '/api/datasets/:datasetId/batches' as const,
      responses: {
        200: z.array(z.custom<typeof batches.$inferSelect>()),
      }
    },
    goldenBatch: {
      method: 'GET' as const,
      path: '/api/datasets/:datasetId/golden-batch' as const,
      responses: {
        200: z.custom<typeof batches.$inferSelect>().nullable(),
      }
    }
  },
  recommendations: {
    get: {
      method: 'GET' as const,
      path: '/api/datasets/:datasetId/recommendations' as const,
      responses: {
        200: z.custom<typeof recommendations.$inferSelect>().nullable(),
      }
    }
  },
  predictions: {
    forecast: {
      method: 'GET' as const,
      path: '/api/datasets/:datasetId/forecast' as const,
      responses: {
        200: z.array(z.object({
          batchIdString: z.string(),
          predictedYield: z.number()
        })),
      }
    },
    simulate: {
      method: 'POST' as const,
      path: '/api/simulate' as const,
      input: z.object({
        temperature: z.number(),
        machineSpeed: z.number(),
        energy: z.number(),
        carbon: z.number()
      }),
      responses: {
        200: z.object({
          predictedYield: z.number()
        })
      }
    }
  },
  copilot: {
    query: {
      method: 'POST' as const,
      path: '/api/copilot' as const,
      input: z.object({
        query: z.string(),
        datasetId: z.number().optional()
      }),
      responses: {
        200: z.object({
          response: z.string()
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
