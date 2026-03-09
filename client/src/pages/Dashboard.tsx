import React from 'react';
import { useBatches, useGoldenBatch } from '@/hooks/use-smartbatch';
import { useActiveDataset } from '@/context/DatasetContext';
import { Activity, AlertTriangle, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { activeDatasetId } = useActiveDataset();
  const { data: batches = [], isLoading } = useBatches(activeDatasetId);
  const { data: goldenBatch } = useGoldenBatch(activeDatasetId);

  if (!activeDatasetId) {
    return (
      <div className="h-full flex items-center justify-center flex-col text-center">
        <Activity className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-display font-semibold mb-2">No Dataset Selected</h2>
        <p className="text-muted-foreground">Please upload or select a dataset from the top menu to view the dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-32 bg-card/50 rounded-2xl"></div>
      <div className="h-64 bg-card/50 rounded-2xl"></div>
    </div>;
  }

  const avgYield = batches.length ? (batches.reduce((acc: any, b: any) => acc + b.yieldRate, 0) / batches.length).toFixed(1) : '0';
  const anomaliesCount = batches.filter((b: any) => b.isAnomaly).length;
  const avgEnergy = batches.length ? (batches.reduce((acc: any, b: any) => acc + b.energy, 0) / batches.length).toFixed(1) : '0';

  const metrics = [
    { label: "Total Batches", value: batches.length, icon: Activity, color: "text-blue-400" },
    { label: "Average Yield", value: `${avgYield}%`, icon: Target, color: "text-green-400" },
    { label: "Avg Energy (kWh)", value: avgEnergy, icon: Zap, color: "text-yellow-400" },
    { label: "Anomalies Detected", value: anomaliesCount, icon: AlertTriangle, color: "text-red-400" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-display font-bold mb-2 text-white">System Overview</h2>
        <p className="text-muted-foreground">Real-time health and performance metrics for the selected production line.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex items-start justify-between group hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{m.label}</p>
              <h3 className="text-3xl font-display font-bold text-white">{m.value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${m.color}`}>
              <m.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Batches List */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-bold">Recent Batches</h3>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Batch ID</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Yield</th>
                  <th className="pb-3 font-medium">Energy</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {batches.slice(0, 5).map((batch: any) => (
                  <tr key={batch.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 font-mono text-white">{batch.batchIdString}</td>
                    <td className="py-4 text-muted-foreground">{new Date(batch.timestamp).toLocaleTimeString()}</td>
                    <td className="py-4 font-medium text-green-400">{batch.yieldRate}%</td>
                    <td className="py-4">{batch.energy}</td>
                    <td className="py-4">
                      {batch.isAnomaly ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">Anomaly</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">Optimal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Golden Batch Highlight */}
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-b from-card to-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
          <h3 className="text-xl font-display font-bold mb-6 relative z-10">Golden Batch Target</h3>
          
          {goldenBatch ? (
            <div className="space-y-6 relative z-10">
              <div className="text-center p-4 rounded-xl bg-black/40 border border-white/10">
                <p className="text-sm text-muted-foreground mb-1">Target Yield</p>
                <p className="text-4xl font-display font-bold text-primary neon-text">{goldenBatch.yieldRate}%</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ideal Temp:</span>
                  <span className="font-mono text-white">{goldenBatch.temperature}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Optimal Speed:</span>
                  <span className="font-mono text-white">{goldenBatch.machineSpeed} rpm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Target Energy:</span>
                  <span className="font-mono text-white">{goldenBatch.energy} kWh</span>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
               Calculating golden parameters...
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
