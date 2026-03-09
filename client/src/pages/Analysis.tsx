import React from 'react';
import { useBatches } from '@/hooks/use-smartbatch';
import { useActiveDataset } from '@/context/DatasetContext';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Analysis() {
  const { activeDatasetId } = useActiveDataset();
  const { data: batches = [] } = useBatches(activeDatasetId);

  if (!activeDatasetId) return <div className="text-center p-10 text-muted-foreground">Select a dataset first.</div>;

  const anomalies = batches.filter((b: any) => b.isAnomaly).sort((a: any, b: any) => b.score - a.score);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2 text-white">AI Anomaly Analysis</h2>
        <p className="text-muted-foreground">Isolation Forest algorithm results identifying critical batch deviations.</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Detected Anomalies</h3>
              <p className="text-sm text-muted-foreground">{anomalies.length} potential failures identified</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr className="text-sm text-muted-foreground">
                <th className="p-4 font-medium">Batch ID</th>
                <th className="p-4 font-medium">Anomaly Score</th>
                <th className="p-4 font-medium">Temp Deviation</th>
                <th className="p-4 font-medium">Energy Spikes</th>
                <th className="p-4 font-medium">Yield Impact</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
                    No anomalies detected in this dataset.
                  </td>
                </tr>
              ) : (
                anomalies.map((batch: any) => (
                  <tr key={batch.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-white">{batch.batchIdString}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500" 
                            style={{ width: `${Math.min(batch.score * 10, 100)}%` }} 
                          />
                        </div>
                        <span className="text-red-400 font-medium">{batch.score?.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white">{batch.temperature}°C</td>
                    <td className="p-4 text-white">{batch.energy} kWh</td>
                    <td className="p-4 text-red-400 font-medium">{batch.yieldRate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
