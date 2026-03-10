import React, { useMemo } from 'react';
import { useBatches } from '@/hooks/use-smartbatch';
import { useActiveDataset } from '@/context/DatasetContext';
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function formatNumber(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

function getRange(values: number[]) {
  if (values.length === 0) {
    return [0, 1] as const;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [min - 1, max + 1] as const;
  }

  return [min, max] as const;
}

function buildTrend(
  data: Array<{ yield: number; temperature: number; speed: number }>,
  xKey: 'temperature' | 'speed',
  bucketSize: number
) {
  const buckets = new Map<number, { totalYield: number; count: number }>();

  for (const row of data) {
    const value = row[xKey];
    const bucket = Math.round(value / bucketSize) * bucketSize;
    const current = buckets.get(bucket) ?? { totalYield: 0, count: 0 };
    current.totalYield += row.yield;
    current.count += 1;
    buckets.set(bucket, current);
  }

  return Array.from(buckets.entries())
    .map(([x, item]) => ({
      x,
      avgYield: item.totalYield / item.count,
    }))
    .sort((a, b) => a.x - b.x);
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<any>;
  xLabel: string;
  xUnit: string;
};

function CustomTooltip({ active, payload, xLabel, xUnit }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const row = payload.find((item: any) => item?.payload?.id)?.payload ?? payload[0]?.payload;
  if (!row) {
    return null;
  }

  return (
    <div className="glass-card p-4 rounded-xl border border-white/10 text-sm">
      <p className="font-bold text-white mb-2">{row.id || 'Trend Bucket'}</p>
      <p className="text-muted-foreground">
        {xLabel}:{' '}
        <span className="text-white">
          {formatNumber(row.x ?? row.temperature ?? row.speed, 1)} {xUnit}
        </span>
      </p>
      <p className="text-muted-foreground">
        Yield: <span className="text-white">{formatNumber(row.yield ?? row.avgYield ?? 0, 2)}%</span>
      </p>
      {row.energy !== undefined && (
        <p className="text-muted-foreground">
          Energy: <span className="text-white">{formatNumber(row.energy, 1)} kWh</span>
        </p>
      )}
      {row.anomaly && (
        <p className={`mt-2 font-medium ${row.anomaly === 'Anomaly' ? 'text-red-400' : 'text-green-400'}`}>
          {row.anomaly}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-2">Dark line shows average trend by bucket.</p>
    </div>
  );
}

export default function Analytics() {
  const { activeDatasetId } = useActiveDataset();
  const { data: batches = [] } = useBatches(activeDatasetId);

  if (!activeDatasetId) {
    return <div className="text-center p-10 text-muted-foreground">Select a dataset first.</div>;
  }

  const chartData = useMemo(
    () =>
      batches.map((b: any) => ({
        temperature: b.temperature,
        yield: b.yieldRate,
        energy: b.energy,
        speed: b.machineSpeed,
        anomaly: b.isAnomaly ? 'Anomaly' : 'Normal',
        id: b.batchIdString,
      })),
    [batches]
  );

  const sampledData = useMemo(() => {
    const maxPoints = 4000;
    if (chartData.length <= maxPoints) {
      return chartData;
    }
    const step = Math.ceil(chartData.length / maxPoints);
    return chartData.filter((_: (typeof chartData)[number], index: number) => index % step === 0);
  }, [chartData]);

  const normalData = sampledData.filter((d: any) => d.anomaly === 'Normal');
  const anomalyData = sampledData.filter((d: any) => d.anomaly === 'Anomaly');

  const tempTrend = useMemo(() => buildTrend(sampledData, 'temperature', 2), [sampledData]);
  const speedTrend = useMemo(() => buildTrend(sampledData, 'speed', 25), [sampledData]);

  const avgYield = useMemo(() => {
    if (chartData.length === 0) {
      return 0;
    }
    return chartData.reduce((sum: number, row: (typeof chartData)[number]) => sum + row.yield, 0) / chartData.length;
  }, [chartData]);

  const [tempMin, tempMax] = getRange(sampledData.map((d: (typeof sampledData)[number]) => d.temperature));
  const [speedMin, speedMax] = getRange(sampledData.map((d: (typeof sampledData)[number]) => d.speed));
  const [yieldMin, yieldMax] = getRange(sampledData.map((d: (typeof sampledData)[number]) => d.yield));

  const yieldPadding = Math.max(1, (yieldMax - yieldMin) * 0.08);
  const sampledPercent = chartData.length ? Math.round((sampledData.length / chartData.length) * 100) : 100;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2 text-white">Batch Analytics</h2>
        <p className="text-muted-foreground">Correlations between manufacturing parameters and final yield.</p>
      </div>

      <div className="glass-card p-4 rounded-xl border border-white/10 text-sm text-muted-foreground">
        Viewing {sampledData.length.toLocaleString()} points ({sampledPercent}% sample) for clarity. Average yield:{' '}
        <span className="text-white font-semibold">{formatNumber(avgYield, 2)}%</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-medium mb-2">Temperature vs. Yield</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Scatter points show batches. Trend line groups temperature in 2 deg buckets.
          </p>
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 16, right: 24, bottom: 20, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  type="number"
                  dataKey="temperature"
                  name="Temperature"
                  unit="degC"
                  stroke="#94A3B8"
                  domain={[tempMin - 1, tempMax + 1]}
                  tickFormatter={(value) => `${value} degC`}
                />
                <YAxis
                  type="number"
                  dataKey="yield"
                  name="Yield"
                  unit="%"
                  stroke="#94A3B8"
                  domain={[yieldMin - yieldPadding, yieldMax + yieldPadding]}
                  tickFormatter={(value) => `${formatNumber(value, 1)}%`}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip xLabel="Temperature" xUnit="degC" />} />
                <Legend verticalAlign="top" height={36} />
                <ReferenceLine
                  y={avgYield}
                  stroke="#64748B"
                  strokeDasharray="6 4"
                  label={{ value: 'Avg Yield', fill: '#94A3B8', fontSize: 11 }}
                />
                <Scatter name="Normal batches" data={normalData} fill="#22D3EE" opacity={0.22} />
                <Scatter name="Anomaly batches" data={anomalyData} fill="#F87171" opacity={0.9} />
                <Line
                  name="Temperature trend"
                  data={tempTrend}
                  type="monotone"
                  dataKey="avgYield"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-medium mb-2">Machine Speed vs. Yield</h3>
          <p className="text-xs text-muted-foreground mb-4">Trend line groups machine speed in 25 rpm buckets.</p>
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 16, right: 24, bottom: 20, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  type="number"
                  dataKey="speed"
                  name="Machine Speed"
                  unit="rpm"
                  stroke="#94A3B8"
                  domain={[speedMin - 25, speedMax + 25]}
                  tickFormatter={(value) => `${Math.round(value)} rpm`}
                />
                <YAxis
                  type="number"
                  dataKey="yield"
                  name="Yield"
                  unit="%"
                  stroke="#94A3B8"
                  domain={[yieldMin - yieldPadding, yieldMax + yieldPadding]}
                  tickFormatter={(value) => `${formatNumber(value, 1)}%`}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip xLabel="Machine Speed" xUnit="rpm" />} />
                <Legend verticalAlign="top" height={36} />
                <ReferenceLine
                  y={avgYield}
                  stroke="#64748B"
                  strokeDasharray="6 4"
                  label={{ value: 'Avg Yield', fill: '#94A3B8', fontSize: 11 }}
                />
                <Scatter name="Normal batches" data={normalData} fill="#14B8A6" opacity={0.22} />
                <Scatter name="Anomaly batches" data={anomalyData} fill="#F87171" opacity={0.9} />
                <Line
                  name="Speed trend"
                  data={speedTrend}
                  type="monotone"
                  dataKey="avgYield"
                  stroke="#2DD4BF"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
