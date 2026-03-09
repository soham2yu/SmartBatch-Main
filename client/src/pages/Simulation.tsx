import React, { useState, useEffect } from 'react';
import { useSimulate } from '@/hooks/use-smartbatch';
import { Sliders, Cpu, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Simulation() {
  const simulateMutation = useSimulate();
  
  const [params, setParams] = useState({
    temperature: 200,
    machineSpeed: 1500,
    energy: 50,
    carbon: 10
  });

  const [predictedYield, setPredictedYield] = useState<number | null>(null);

  // Debounced simulation call
  useEffect(() => {
    const timer = setTimeout(() => {
      simulateMutation.mutate(params, {
        onSuccess: (data) => setPredictedYield(data.predictedYield)
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [params]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2 text-white">Digital Twin Simulation</h2>
        <p className="text-muted-foreground">Adjust parameters to predict manufacturing yield in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-7 glass-card p-8 rounded-3xl space-y-8">
          <div className="flex items-center gap-3 mb-4">
            <Sliders className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">Input Parameters</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="text-muted-foreground">Temperature (°C)</label>
                <span className="font-mono text-white font-bold">{params.temperature}</span>
              </div>
              <input 
                type="range" name="temperature" min="100" max="300" step="1" 
                value={params.temperature} onChange={handleSliderChange} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="text-muted-foreground">Machine Speed (rpm)</label>
                <span className="font-mono text-white font-bold">{params.machineSpeed}</span>
              </div>
              <input 
                type="range" name="machineSpeed" min="500" max="3000" step="10" 
                value={params.machineSpeed} onChange={handleSliderChange} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="text-muted-foreground">Energy Input (kWh)</label>
                <span className="font-mono text-white font-bold">{params.energy}</span>
              </div>
              <input 
                type="range" name="energy" min="10" max="200" step="1" 
                value={params.energy} onChange={handleSliderChange} 
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="text-muted-foreground">Carbon Intensity</label>
                <span className="font-mono text-white font-bold">{params.carbon}</span>
              </div>
              <input 
                type="range" name="carbon" min="1" max="50" step="0.5" 
                value={params.carbon} onChange={handleSliderChange} 
              />
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-5 glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
          
          <div className="relative z-10 w-full">
            <Cpu className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
            <h3 className="text-lg text-muted-foreground mb-2">Predicted Yield</h3>
            
            <div className="h-32 flex items-center justify-center">
              {simulateMutation.isPending && predictedYield === null ? (
                <Activity className="w-8 h-8 text-primary animate-pulse" />
              ) : (
                <motion.div 
                  key={predictedYield}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent neon-text"
                >
                  {predictedYield?.toFixed(1) || '--'}%
                </motion.div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-6 px-4">
              AI model is simulating physical dynamics based on historical regression data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
