import React from 'react';
import { useRecommendations, useGoldenBatch } from '@/hooks/use-smartbatch';
import { useActiveDataset } from '@/context/DatasetContext';
import { Target, ArrowRight, Zap, TrendingUp, Leaf } from 'lucide-react';

export default function Recommendations() {
  const { activeDatasetId } = useActiveDataset();
  const { data: recs } = useRecommendations(activeDatasetId);
  const { data: golden } = useGoldenBatch(activeDatasetId);

  if (!activeDatasetId) return <div className="text-center p-10 text-muted-foreground">Select a dataset first.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2 text-white">AI Recommendations</h2>
        <p className="text-muted-foreground">Actionable parameter adjustments to achieve Golden Batch quality.</p>
      </div>

      {recs && golden ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Plan */}
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
              <Target className="text-primary w-6 h-6" /> Optimization Plan
            </h3>
            
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Temperature Adjustment</p>
                  <p className="text-xl font-bold text-white">Set to {recs.recommendedTemp}°C</p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Machine Speed</p>
                  <p className="text-xl font-bold text-white">Lock at {recs.recommendedSpeed} rpm</p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Projected Impact */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-card to-green-500/10 border-green-500/20">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-full bg-green-500/20"><TrendingUp className="text-green-400 w-6 h-6" /></div>
                <h4 className="text-lg font-bold">Yield Improvement</h4>
              </div>
              <p className="text-4xl font-display font-bold text-green-400 mt-4">+{recs.yieldImprovement.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-2">Expected increase in flawless output.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-card to-yellow-500/10 border-yellow-500/20">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-full bg-yellow-500/20"><Zap className="text-yellow-400 w-6 h-6" /></div>
                <h4 className="text-lg font-bold">Energy Reduction</h4>
              </div>
              <p className="text-4xl font-display font-bold text-yellow-400 mt-4">-{recs.energyReduction.toFixed(1)} kWh</p>
              <p className="text-sm text-muted-foreground mt-2">Saved per batch via optimized heating.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-card to-teal-500/10 border-teal-500/20">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-full bg-teal-500/20"><Leaf className="text-teal-400 w-6 h-6" /></div>
                <h4 className="text-lg font-bold">Carbon Offset</h4>
              </div>
              <p className="text-4xl font-display font-bold text-teal-400 mt-4">-{recs.carbonReduction.toFixed(1)} kg</p>
              <p className="text-sm text-muted-foreground mt-2">CO2 emission reduction per cycle.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 rounded-3xl text-center">
          <p className="text-muted-foreground">Insufficient data to generate recommendations. Please ensure enough batches are uploaded.</p>
        </div>
      )}
    </div>
  );
}
