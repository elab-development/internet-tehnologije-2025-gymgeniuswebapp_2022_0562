'use client';

import ProgressChart from './ProgressChart';

interface WorkoutVolumeChartProps {
  data: Array<{ date: string; volume: number; duration: number }>;
}

export default function WorkoutVolumeChart({ data }: WorkoutVolumeChartProps) {
  const chartData = [
    ['Date', 'Volume (kg)', 'Duration (min)'],
    ...data.map((item) => [new Date(item.date).toLocaleDateString(), item.volume, item.duration]),
  ];

  return (
    <ProgressChart
      data={chartData}
      title="Workout Volume & Duration"
      chartType="ColumnChart"
      vAxisTitle="Value"
      hAxisTitle="Date"
    />
  );
}
