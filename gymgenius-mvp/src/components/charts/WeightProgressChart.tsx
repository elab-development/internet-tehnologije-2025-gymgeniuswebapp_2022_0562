'use client';

import ProgressChart from './ProgressChart';

interface WeightProgressChartProps {
  data: Array<{ date: string; weight: number }>;
}

export default function WeightProgressChart({ data }: WeightProgressChartProps) {
  // Transform data for Google Charts
  const chartData = [
    ['Date', 'Weight (kg)'],
    ...data.map((item) => [item.date, item.weight]),
  ];

  return (
    <ProgressChart
      data={chartData}
      title="Weight Progress"
      chartType="LineChart"
      vAxisTitle="Weight (kg)"
      hAxisTitle="Date"
    />
  );
}
