'use client';

import ProgressChart from './ProgressChart';

interface MuscleGroupPieChartProps {
  data: Array<{ muscle: string; sets: number }>;
}

export default function MuscleGroupPieChart({ data }: MuscleGroupPieChartProps) {
  const chartData = [
    ['Muscle Group', 'Sets'],
    ...data.map((item) => [item.muscle, item.sets]),
  ];

  return (
    <ProgressChart
      data={chartData}
      title="Muscle Group Distribution"
      chartType="PieChart"
      height="350px"
    />
  );
}
