'use client';

import { Chart } from 'react-google-charts';

interface ProgressChartProps {
  data: any[];
  title: string;
  chartType?: 'LineChart' | 'ColumnChart' | 'AreaChart' | 'PieChart';
  height?: string;
  vAxisTitle?: string;
  hAxisTitle?: string;
}

export default function ProgressChart({
  data,
  title,
  chartType = 'LineChart',
  height = '400px',
  vAxisTitle,
  hAxisTitle,
}: ProgressChartProps) {
  const options = {
    title,
    curveType: chartType === 'LineChart' ? 'function' : undefined,
    legend: { position: 'bottom' },
    hAxis: {
      title: hAxisTitle || '',
    },
    vAxis: {
      title: vAxisTitle || '',
      minValue: 0,
    },
    colors: ['#0ea5e9', '#d946ef', '#f97316', '#10b981'],
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out',
    },
  };

  return (
    <div className="w-full">
      <Chart
        chartType={chartType}
        width="100%"
        height={height}
        data={data}
        options={options}
      />
    </div>
  );
}
