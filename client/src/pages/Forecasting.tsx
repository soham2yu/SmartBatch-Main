import React from 'react';
import { useForecast } from '@/hooks/use-smartbatch';
import { useActiveDataset } from '@/context/DatasetContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Forecasting() {
  const { activeDatasetId } = useActiveDataset();
  const { data: forecastData = [], isLoading } = useForecast(activeDatasetId);

  if (!activeDatasetId) return <div className="text-center p-10 text-muted-foreground">Select a dataset first.</div>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 rounded-xl border border-white/10 text-sm">
          <p className="font-bold text-white mb-2">{label}</p>
          <p className="text-primary font-medium">Predicted Yield: {payload[0].value.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2 text-white">Yield Forecasting</h2>
        <p className="text-muted-foreground">Predictive models estimating the performance of the next 10 upcoming batches.</p>
      </div>

      <div className="glass-card p-8 rounded-3xl">
        {isLoading ? (
           <div className="h-[500px] flex items-center justify-center animate-pulse bg-white/5 rounded-xl" />
        ) : forecastData.length === 0 ? (
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            No forecast data available for this dataset.
          </div>
        ) : (
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="batchIdString" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
                <YAxis domain={['auto', 'auto']} stroke="#94A3B8" unit="%" tick={{ fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="predictedYield" 
                  stroke="#22D3EE" 
                  strokeWidth={3}
                  dot={{ fill: '#0EA5FF', r: 6, strokeWidth: 2, stroke: '#020617' }}
                  activeDot={{ r: 8, fill: '#fff' }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
