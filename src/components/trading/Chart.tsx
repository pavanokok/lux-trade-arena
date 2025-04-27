
import { useRef, useEffect, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeriesOptions, Time } from 'lightweight-charts';
import { CandleData } from '@/utils/marketData';

interface ChartProps {
  data: CandleData[];
  width?: number | string;
  height?: number;
  darkMode?: boolean;
  symbol: string;
}

const Chart = ({ data, width = '100%', height = 400, darkMode = true, symbol }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [series, setSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);

  // Chart colors based on theme
  const backgroundColor = darkMode ? '#131722' : '#FFFFFF';
  const textColor = darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const upColor = '#26a69a';
  const downColor = '#ef5350';

  // Initialize chart
  useEffect(() => {
    if (chartContainerRef.current) {
      const handleResize = () => {
        chart?.applyOptions({ 
          width: chartContainerRef.current?.clientWidth || 600 
        });
      };

      const newChart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height,
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
          textColor,
        },
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: gridColor,
        },
        crosshair: {
          mode: 0,
        },
      });

      // Create candlestick series
      const newSeries = newChart.addCandlestickSeries({
        upColor,
        downColor,
        borderVisible: false,
        wickUpColor: upColor,
        wickDownColor: downColor,
      });

      setChart(newChart);
      setSeries(newSeries);

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        newChart.remove();
      };
    }
  }, [darkMode]);

  // Update data when it changes
  useEffect(() => {
    if (series && data && data.length > 0) {
      // Convert the data to the format expected by lightweight-charts
      const formattedData = data.map(item => ({
        time: item.time as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      }));
      
      series.setData(formattedData);
    }
  }, [series, data]);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium">{symbol} Price Chart</h3>
      </div>
      <div 
        ref={chartContainerRef} 
        className="rounded-lg border border-border/40 bg-secondary/10 overflow-hidden"
        style={{ height }}
      />
    </div>
  );
};

export default Chart;
