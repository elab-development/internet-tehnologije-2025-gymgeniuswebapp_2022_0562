'use client';

import ProgressChart from './ProgressChart';

interface CalorieIntakeChartProps {
  data: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export default function CalorieIntakeChart({ data }: CalorieIntakeChartProps) {
  const chartData = [
    ['Date', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
    ...data.map((item) => [item.date, item.calories, item.protein, item.carbs, item.fat]),
  ];

  return (
    <ProgressChart
      data={chartData}
      title="Daily Calorie & Macros Intake"
      chartType="AreaChart"
      vAxisTitle="Amount"
      hAxisTitle="Date"
    />
  );
}
