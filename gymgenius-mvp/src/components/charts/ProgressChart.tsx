'use client';

import { useEffect, useRef } from 'react';

interface ProgressChartProps {
  data: any[];
  title: string;
  chartType?: 'LineChart' | 'ColumnChart' | 'AreaChart' | 'PieChart';
  height?: string;
  vAxisTitle?: string;
  hAxisTitle?: string;
}

// Singleton — loader.js se ubacuje samo jednom, Promise se deli između svih instanci
let chartsReadyPromise: Promise<void> | null = null;

function loadGoogleCharts(): Promise<void> {
  if (chartsReadyPromise) return chartsReadyPromise;

  chartsReadyPromise = new Promise<void>((resolve, reject) => {
    // Već učitano (hot-reload scenario)
    if ((window as any).google?.visualization) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.async = true;

    script.onload = () => {
      const g = (window as any).google;
      g.charts.load('current', { packages: ['corechart'] });
      g.charts.setOnLoadCallback(() => resolve());
    };

    script.onerror = () => {
      chartsReadyPromise = null; // dozvoli retry
      reject(new Error('[ProgressChart] Failed to load Google Charts loader.js'));
    };

    document.head.appendChild(script);
  });

  return chartsReadyPromise;
}

export default function ProgressChart({
  data,
  title,
  chartType = 'LineChart',
  height = '400px',
  vAxisTitle,
  hAxisTitle,
}: ProgressChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    // data[0] = header row, potreban je bar još jedan red
    if (!container || !data || data.length < 2) return;

    loadGoogleCharts()
      .then(() => {
        // Provjeri da kontejner nije unmountovan dok se čekalo na loader
        if (!container.isConnected) return;

        const google = (window as any).google;
        const VisualizationClass = google.visualization[chartType];

        if (!VisualizationClass) {
          console.error('[ProgressChart] Nepoznat tip grafikona:', chartType);
          return;
        }

        const table = google.visualization.arrayToDataTable(data);
        const chart = new VisualizationClass(container);

        chart.draw(table, {
          title,
          legend: { position: 'bottom' },
          hAxis: { title: hAxisTitle ?? '' },
          vAxis: { title: vAxisTitle ?? '', minValue: 0 },
          colors: ['#0ea5e9', '#d946ef', '#f97316', '#10b981'],
          ...(chartType === 'LineChart' && { curveType: 'function' }),
        });
      })
      .catch((err) => console.error('[ProgressChart] Greška pri crtanju grafikona:', err));
  }, [data, title, chartType, height, vAxisTitle, hAxisTitle]);

  return (
    <div
      ref={containerRef}
      data-testid="google-chart"
      className="w-full"
      style={{ height }}
    />
  );
}
