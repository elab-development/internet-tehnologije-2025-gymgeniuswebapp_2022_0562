import { render, screen } from '@testing-library/react';
import WeightProgressChart from '../WeightProgressChart';
import WorkoutVolumeChart from '../WorkoutVolumeChart';
import CalorieIntakeChart from '../CalorieIntakeChart';

// Mock react-google-charts
jest.mock('react-google-charts', () => ({
  Chart: ({ title }: any) => <div data-testid="google-chart">{title}</div>,
}));

describe('Chart Components', () => {
  it('should render WeightProgressChart', () => {
    const data = [
      { date: '2024-01-01', weight: 75 },
      { date: '2024-01-08', weight: 74.5 },
    ];

    render(<WeightProgressChart data={data} />);
    expect(screen.getByTestId('google-chart')).toBeInTheDocument();
  });

  it('should render WorkoutVolumeChart', () => {
    const data = [
      { date: new Date('2024-01-01'), volume: 1000, duration: 60 },
      { date: new Date('2024-01-02'), volume: 1200, duration: 65 },
    ];

    render(<WorkoutVolumeChart data={data} />);
    expect(screen.getByTestId('google-chart')).toBeInTheDocument();
  });

  it('should render CalorieIntakeChart', () => {
    const data = [
      { date: '2024-01-01', calories: 2000, protein: 150, carbs: 200, fat: 60 },
    ];

    render(<CalorieIntakeChart data={data} />);
    expect(screen.getByTestId('google-chart')).toBeInTheDocument();
  });
});
