import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// Utility for safely parsing JSON and handling errors
async function fetchApi(url: string, options?: RequestInit) {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    let errorMsg = `API Error: ${res.status}`;
    try {
      const errData = await res.json();
      errorMsg = errData.message || errorMsg;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMsg);
  }
  return res.status === 204 ? null : res.json();
}

// ==========================================
// Datasets
// ==========================================

export function useDatasets() {
  return useQuery({
    queryKey: [api.datasets.list.path],
    queryFn: () => fetchApi(api.datasets.list.path),
  });
}

export function useUploadDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      // Omit Content-Type so browser sets boundary automatically
      const res = await fetch(api.datasets.upload.path, {
        method: api.datasets.upload.method,
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.datasets.list.path] });
    },
  });
}

// ==========================================
// Batches
// ==========================================

export function useBatches(datasetId?: number) {
  return useQuery({
    queryKey: ['batches', datasetId],
    queryFn: () => {
      if (!datasetId) return [];
      const url = buildUrl(api.batches.list.path, { datasetId });
      return fetchApi(url);
    },
    enabled: !!datasetId,
  });
}

export function useGoldenBatch(datasetId?: number) {
  return useQuery({
    queryKey: ['golden-batch', datasetId],
    queryFn: () => {
      if (!datasetId) return null;
      const url = buildUrl(api.batches.goldenBatch.path, { datasetId });
      return fetchApi(url);
    },
    enabled: !!datasetId,
  });
}

// ==========================================
// Recommendations
// ==========================================

export function useRecommendations(datasetId?: number) {
  return useQuery({
    queryKey: ['recommendations', datasetId],
    queryFn: () => {
      if (!datasetId) return null;
      const url = buildUrl(api.recommendations.get.path, { datasetId });
      return fetchApi(url);
    },
    enabled: !!datasetId,
  });
}

// ==========================================
// Predictions & Simulation
// ==========================================

export function useForecast(datasetId?: number) {
  return useQuery({
    queryKey: ['forecast', datasetId],
    queryFn: () => {
      if (!datasetId) return [];
      const url = buildUrl(api.predictions.forecast.path, { datasetId });
      return fetchApi(url);
    },
    enabled: !!datasetId,
  });
}

export function useSimulate() {
  return useMutation({
    mutationFn: async (data: { temperature: number, machineSpeed: number, energy: number, carbon: number }) => {
      return fetchApi(api.predictions.simulate.path, {
        method: api.predictions.simulate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  });
}

// ==========================================
// Copilot
// ==========================================

export function useCopilot() {
  return useMutation({
    mutationFn: async (data: { query: string, datasetId?: number }) => {
      return fetchApi(api.copilot.query.path, {
        method: api.copilot.query.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  });
}
