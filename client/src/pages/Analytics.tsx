import React from 'react';
import { useBatches } from '@/hooks/use-smartbatch';
import { useActiveDataset } from '@/context/DatasetContext';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

export default function Analytics() {
  const { activeDatasetId } = useActiveDataset();
  const { data: batches = [] } = useBatches(activeDatasetId);

  if (!activeDatasetId) return <div className="text-center p-10 text-muted-foreground">Select a dataset first.</div>;

  // Format data for charts
  const chartData = batches.map((b: any) => ({
    x: b.temperature,
    y: b.yieldRate,
    z: b.energy,
    anomaly: b.isAnomaly ? 'Anomaly' : 'Normal',
    id: b.batchIdString
  }));

  const normalData = chartData.filter((d: any) => d.anomaly === 'Normal');
  const anomalyData = chartData.filter((d: any) => d.anomaly === 'Anomaly');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-4 rounded-xl border border-white/10 text-sm">
          <p className="font-bold text-white mb-2">{data.id}</p>
          <p className="text-muted-foreground">Temp: <span className="text-white">{data.x}°C</span></p>
          <p className="text-muted-foreground">Yield: <span className="text-white">{data.y}%</span></p>
          <p className="text-muted-foreground">Energy: <span className="text-white">{data.z} kWh</span></p>
          <p className={`mt-2 font-medium ${data.anomaly === 'Anomaly' ? 'text-red-400' : 'text-green-400'}`}>
            {data.anomaly}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2 text-white">Batch Analytics</h2>
        <p className="text-muted-foreground">Correlations between manufacturing parameters and final yield.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-medium mb-6">Temperature vs. Yield</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="x" name="Temperature" unit="°C" stroke="#94A3B8" />
                <YAxis type="number" dataKey="y" name="Yield" unit="%" stroke="#94A3B8" />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Energy" unit="kWh" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter name="Normal" data={normalData} fill="#22D3EE" opacity={0.6} />
                <Scatter name="Anomaly" data={anomalyData} fill="#F87171" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 - Speed vs Yield */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-medium mb-6">Machine Speed vs. Yield</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="z" name="Machine Speed" unit="rpm" stroke="#94A3B8" />
                <YAxis type="number" dataKey="y" name="Yield" unit="%" stroke="#94A3B8" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter name="Normal" data={normalData} fill="#14B8A6" opacity={0.6} />
                <Scatter name="Anomaly" data={anomalyData} fill="#F87171" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
