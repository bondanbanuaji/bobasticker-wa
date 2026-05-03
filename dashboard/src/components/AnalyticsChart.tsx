import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Chart: any;
  }
}

export function AnalyticsChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    // Wait for the Chart.js CDN script to load
    const initChart = () => {
      if (!window.Chart || !chartRef.current) {
        setTimeout(initChart, 200);
        return;
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)'); // Blue-500 with opacity
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

      chartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
          datasets: [
            {
              label: 'Messages Processed',
              data: [12, 19, 15, 25, 22, 30, 28],
              borderColor: '#3b82f6', // blue-500
              backgroundColor: gradient,
              borderWidth: 3,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#3b82f6',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true,
              tension: 0.4, // smooth curves
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: '#1e293b',
              titleFont: { family: 'Google Sans Flex' },
              bodyFont: { family: 'Montserrat' },
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e2e8f0', // slate-200
                drawBorder: false,
              },
              ticks: {
                font: { family: 'Montserrat' },
                color: '#64748b', // slate-500
              },
            },
            x: {
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                font: { family: 'Montserrat' },
                color: '#64748b',
              },
            },
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
        },
      });
    };

    initChart();

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (chartInstance.current) {
        const data = chartInstance.current.data.datasets[0].data;
        const labels = chartInstance.current.data.labels;
        
        // Remove first element
        data.shift();
        labels.shift();
        
        // Add new element
        data.push(Math.floor(Math.random() * 20) + 15);
        
        const now = new Date();
        labels.push(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        
        chartInstance.current.update();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-[250px] relative">
      <canvas ref={chartRef} />
    </div>
  );
}
