import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useTimeTrack } from '@/contexts/TimeTrackContext';

// Register the Chart.js components
Chart.register(...registerables);

export default function WeeklyChart() {
  const { visits, focusSessions } = useTimeTrack();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const [timeRange, setTimeRange] = useState('7');
  
  // Get day names for the chart
  const getDayLabels = (days: number) => {
    const labels = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return labels;
  };
  
  // Prepare chart data
  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart
      if (chartInstance) {
        chartInstance.destroy();
      }
      
      // Create mock data for the chart (this would use real data in a real implementation)
      const days = parseInt(timeRange);
      const labels = getDayLabels(days);
      
      // Sample data
      const dailyUsageData = [2.5, 3.8, 5.2, 4.2, 3, 1.8, 3.3].slice(7 - days);
      const focusTimeData = [0.8, 1.2, 1.5, 1.3, 0.9, 0.5, 1.0].slice(7 - days);
      
      // Create new chart
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const newChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Daily usage',
                data: dailyUsageData,
                backgroundColor: 'hsl(240, 84%, 59%)', // primary color
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.7
              },
              {
                label: 'Focus time',
                data: focusTimeData,
                backgroundColor: 'hsl(160, 84%, 39%)', // secondary color
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.7
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    const hours = Math.floor(value);
                    const minutes = Math.round((value - hours) * 60);
                    return `${hours}h ${minutes}m`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `${value}h`
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
        
        setChartInstance(newChart);
      }
    }
  }, [timeRange, visits, focusSessions]);
  
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };
  
  return (
    <div className="mt-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-neutral-900">Weekly usage trends</h2>
          <div className="flex items-center space-x-2">
            <select 
              className="form-select text-sm rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
        
        {/* Chart container */}
        <div className="flex flex-col">
          <div className="h-64 mb-4">
            <canvas ref={chartRef}></canvas>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
              <span className="text-sm text-neutral-600">Daily usage</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
              <span className="text-sm text-neutral-600">Focus time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
