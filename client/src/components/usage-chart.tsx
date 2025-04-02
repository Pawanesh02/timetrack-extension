import React, { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Chart from "chart.js/auto";

type DataPoint = {
  label: string;
  value: number;
  color?: string;
};

type ChartDataset = {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth?: number;
  tension?: number;
  pointRadius?: number;
};

type ChartData = {
  labels: string[];
  datasets: ChartDataset[];
};

interface UsageChartProps {
  chartData?: ChartData;
  isLoading: boolean;
  chartType?: "line" | "bar" | "pie";
  height?: number;
}

export default function UsageChart({ 
  chartData, 
  isLoading, 
  chartType = "line",
  height = 250,
}: UsageChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  // Create or update chart when data changes
  useEffect(() => {
    if (isLoading || !chartData || !chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 10,
              usePointStyle: true,
              pointStyle: "circle"
            }
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function(context) {
                const value = context.raw as number;
                return context.dataset.label + ": " + Math.floor(value / 60) + "h " + (value % 60) + "m";
              }
            }
          }
        },
        scales: chartType !== "pie" ? {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Math.floor(Number(value) / 60) + "h";
              }
            },
            title: {
              display: true,
              text: "Time Spent"
            }
          }
        } : undefined
      }
    });
  }, [chartData, isLoading, chartType]);

  if (isLoading) {
    return <Skeleton className="w-full" style={{ height: `${height}px` }} />;
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-neutral-500">No data available</p>
      </div>
    );
  }

  return (
    <div style={{ height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
