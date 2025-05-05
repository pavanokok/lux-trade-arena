
import { useRef, useEffect, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeriesOptions, Time, LineData } from 'lightweight-charts';
import { CandleData } from '@/utils/marketData';
import { Trade } from '@/types/trade';
import TradeMarker from './TradeMarker';

interface ChartProps {
  data: CandleData[];
  width?: number | string;
  height?: number;
  darkMode?: boolean;
  symbol: string;
  trades?: Trade[];
  livePrice?: number;
}

const Chart = ({ data, width = '100%', height = 400, darkMode = true, symbol, trades = [], livePrice }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [series, setSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [lineSeries, setLineSeries] = useState<ISeriesApi<"Line"> | null>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  const [visibleRange, setVisibleRange] = useState({ minTime: 0, maxTime: 0, minPrice: 0, maxPrice: 0 });

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
        if (chart && chartContainerRef.current) {
          const newWidth = chartContainerRef.current.clientWidth;
          const newHeight = height as number;
          
          chart.applyOptions({ width: newWidth });
          setChartDimensions({ width: newWidth, height: newHeight });
        }
      };

      const newChart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height as number,
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
      
      // Add line series for the current price
      const newLineSeries = newChart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        lineStyle: 0, // Solid
        lastValueVisible: true,
        priceLineVisible: true,
        priceLineWidth: 1,
        priceLineColor: '#2962FF',
        priceLineStyle: 2, // Dashed
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      });

      setChart(newChart);
      setSeries(newSeries);
      setLineSeries(newLineSeries);
      setChartDimensions({ 
        width: chartContainerRef.current.clientWidth, 
        height: height as number 
      });

      // Track visible range
      newChart.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
        if (logicalRange !== null && series) {
          const barsInfo = series.barsInLogicalRange(logicalRange);
          if (barsInfo !== null && barsInfo.barsBefore + barsInfo.barsAfter > 0) {
            const firstBar = data[Math.max(0, data.length - barsInfo.barsBefore - barsInfo.barsAfter)];
            const lastBar = data[Math.min(data.length - 1, data.length - barsInfo.barsAfter)];
            
            if (firstBar && lastBar) {
              const prices = data
                .slice(
                  Math.max(0, data.length - barsInfo.barsBefore - barsInfo.barsAfter),
                  Math.min(data.length, data.length - barsInfo.barsAfter + 1)
                )
                .flatMap(bar => [bar.high, bar.low]);
              
              setVisibleRange({
                minTime: firstBar.time as number * 1000,
                maxTime: lastBar.time as number * 1000,
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
              });
            }
          }
        }
      });

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        newChart.remove();
      };
    }
  }, [darkMode, height]);

  // Update data when it changes
  useEffect(() => {
    if (series && data && data.length > 0) {
      series.setData(data);
      
      // Fit content to make sure all data is visible
      if (chart) {
        chart.timeScale().fitContent();
      }
    }
  }, [series, data, chart]);

  // Update the line series with live price if available
  useEffect(() => {
    if (lineSeries && data.length > 0 && livePrice) {
      // Create a line that spans across the visible chart area
      const now = Math.floor(Date.now() / 1000);
      const lineData: LineData[] = [];
      
      // If we have chart data, use its time range
      if (data.length > 1) {
        const firstPoint = {
          time: data[0].time as Time,
          value: livePrice
        };
        const lastPoint = {
          time: now as Time,
          value: livePrice
        };
        
        lineData.push(firstPoint, lastPoint);
      } else {
        // Fallback if no data
        lineData.push({
          time: now as Time,
          value: livePrice
        });
      }
      
      lineSeries.setData(lineData);
    }
  }, [lineSeries, livePrice, data]);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium">{symbol} Price Chart</h3>
      </div>
      <div 
        ref={chartContainerRef} 
        className="rounded-lg border border-border/40 bg-secondary/10 overflow-hidden relative"
        style={{ height }}
      >
        {/* Trade markers overlay */}
        {trades && trades.length > 0 && visibleRange.minTime > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {trades.map(trade => (
              <TradeMarker 
                key={trade.id}
                trade={trade}
                chartWidth={chartDimensions.width}
                chartHeight={chartDimensions.height}
                minTime={visibleRange.minTime}
                maxTime={visibleRange.maxTime}
                minPrice={visibleRange.minPrice}
                maxPrice={visibleRange.maxPrice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;
