import React, { useState } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, Line, CartesianGrid } from 'recharts';
import { Candle } from '../types';

// Custom shape for Candlestick
const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGrowing = close > open;
  const color = isGrowing ? '#10b981' : '#f43f5e'; // emerald-500 vs rose-500
  const ratio = Math.abs(height / (open - close)); // pixel per value unit

  // Avoid zero height
  const bodyHeight = Math.max(Math.abs(open - close) * ratio, 2);
  const bodyY = isGrowing ? y + (high - close) * ratio : y + (high - open) * ratio; 
  
  // Wick calculation
  const wickTop = y;
  const wickBottom = y + (high - low) * ratio;
  const center = x + width / 2;

  return (
    <g stroke={color} fill={color} strokeWidth="1">
      {/* Wick */}
      <line x1={center} y1={wickTop} x2={center} y2={wickBottom} />
      {/* Body */}
      <rect x={x} y={bodyY} width={width} height={bodyHeight} stroke="none" />
    </g>
  );
};

interface CandleChartProps {
  data: Candle[];
}

export const CandleChart: React.FC<CandleChartProps> = ({ data }) => {
  const [showSMA, setShowSMA] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<any>(null);

  // Format data and calculate SMA
  const formattedData = data.map((d, index, array) => {
    // Calculate SMA 20
    let sma = null;
    if (index >= 19) {
      const slice = array.slice(index - 19, index + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      sma = sum / 20;
    }

    return {
      ...d,
      timeStr: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      low: d.low,
      high: d.high,
      open: d.open,
      close: d.close,
      sma, 
      min: d.low,
      max: d.high
    };
  });

  const latestCandle = formattedData[formattedData.length - 1] || {};
  const displayCandle = hoveredCandle || latestCandle;
  const isGrowing = displayCandle.close >= displayCandle.open;
  const diff = displayCandle.close - displayCandle.open;
  const pct = displayCandle.open ? (diff / displayCandle.open) * 100 : 0;

  const minPrice = Math.min(...formattedData.map(d => d.low)) * 0.999;
  const maxPrice = Math.max(...formattedData.map(d => d.high)) * 1.001;

  // Custom tooltip to capture hover state
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // We use this side effect to update the header state, 
        // though typically we'd use onMouseMove on the chart directly.
        // Recharts makes getting specific payload data easier via Tooltip.
        const candleData = payload[0].payload;
        if (candleData !== hoveredCandle) {
            setHoveredCandle(candleData);
        }
        return null; // Don't show default tooltip block, we use the header
    } else {
        if (hoveredCandle !== null) setHoveredCandle(null);
        return null;
    }
  };

  return (
    <div className="h-full w-full bg-surface rounded-lg border border-slate-700 flex flex-col relative group overflow-hidden">
       {/* Top Bar with OHLCV Data */}
       <div className="flex flex-wrap gap-x-4 gap-y-1 items-center px-4 py-2 border-b border-slate-700 bg-slate-900/50 text-xs font-mono z-10">
            <div className="flex items-center gap-2 mr-2">
                <span className="font-bold text-slate-200 text-sm">BTC/USD</span>
                <span className="bg-slate-700 text-slate-300 px-1 rounded text-[10px]">1M</span>
            </div>
            
            <div className="flex gap-3 text-slate-400">
                <span>O: <span className={isGrowing ? 'text-emerald-400' : 'text-rose-400'}>{displayCandle.open?.toFixed(2)}</span></span>
                <span>H: <span className={isGrowing ? 'text-emerald-400' : 'text-rose-400'}>{displayCandle.high?.toFixed(2)}</span></span>
                <span>L: <span className={isGrowing ? 'text-emerald-400' : 'text-rose-400'}>{displayCandle.low?.toFixed(2)}</span></span>
                <span>C: <span className={isGrowing ? 'text-emerald-400' : 'text-rose-400'}>{displayCandle.close?.toFixed(2)}</span></span>
                <span className="">
                    {diff >= 0 ? '+' : ''}{diff.toFixed(2)} ({diff >= 0 ? '+' : ''}{pct.toFixed(2)}%)
                </span>
                <span className="text-slate-500">Vol: {displayCandle.volume?.toFixed(2)}</span>
            </div>

            <div className="ml-auto flex items-center gap-4">
                 <label className="flex items-center gap-1 cursor-pointer hover:text-white text-slate-400 select-none">
                    <input 
                        type="checkbox" 
                        checked={showSMA} 
                        onChange={(e) => setShowSMA(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-600 text-primary focus:ring-0 w-3 h-3"
                    />
                    <span>SMA(20)</span>
                 </label>
            </div>
       </div>

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData} onMouseLeave={() => setHoveredCandle(null)}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis 
                dataKey="timeStr" 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
                minTickGap={40}
                height={20}
            />
            <YAxis 
                domain={[minPrice, maxPrice]} 
                orientation="right"
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val.toFixed(1)}
                width={50}
            />
            
            {/* Transparent Tooltip mainly to trigger state updates */}
            <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                isAnimationActive={false}
            />
            
            {/* SMA Line */}
            {showSMA && (
                <Line 
                    type="monotone" 
                    dataKey="sma" 
                    stroke="#fbbf24" 
                    dot={false} 
                    strokeWidth={1.5} 
                    isAnimationActive={false} 
                />
            )}

            {/* Candlesticks */}
            <Bar 
                dataKey="close" 
                shape={(props: any) => <Candlestick {...props} low={props.payload.low} high={props.payload.high} open={props.payload.open} close={props.payload.close} />} 
                isAnimationActive={false}
            />
            </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};