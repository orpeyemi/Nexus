import React from 'react';
import { Order, OrderSide } from '../types';

interface OrderBookProps {
  buys: Order[];
  sells: Order[];
  currentPrice: number;
}

interface OrderRowProps {
  order: Order;
  maxVol: number;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, maxVol }) => {
  const isBuy = order.side === OrderSide.BUY;
  const color = isBuy ? 'text-emerald-500' : 'text-rose-500';
  const barColor = isBuy ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  const widthPercent = Math.min((order.quantity / maxVol) * 100, 100);

  return (
    <div className="relative flex justify-between text-xs py-0.5 px-2 hover:bg-slate-700 cursor-pointer font-mono group">
      {/* Depth Bar */}
      <div 
        className={`absolute top-0 right-0 h-full ${barColor} transition-all duration-300`} 
        style={{ width: `${widthPercent}%` }}
      />
      
      <span className={`relative z-10 ${color}`}>{order.price.toFixed(2)}</span>
      <span className="relative z-10 text-slate-300">{order.quantity.toFixed(4)}</span>
      <span className="relative z-10 text-slate-400">{(order.price * order.quantity).toLocaleString()}</span>
    </div>
  );
};

export const OrderBook: React.FC<OrderBookProps> = ({ buys, sells, currentPrice }) => {
  const maxVol = Math.max(
    ...buys.map(o => o.quantity),
    ...sells.map(o => o.quantity),
    0.1
  );

  return (
    <div className="flex flex-col h-full bg-surface border-l border-slate-700">
      <div className="px-3 py-2 border-b border-slate-700 font-bold text-slate-200 text-sm">Order Book</div>
      
      {/* Header */}
      <div className="flex justify-between px-2 py-1 text-xs text-muted font-mono">
        <span>Price(USD)</span>
        <span>Amount(BTC)</span>
        <span>Total</span>
      </div>

      {/* Sells (Asks) - Reversed order to show lowest ask at bottom */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-end">
        {sells.slice().reverse().map((order) => (
          <OrderRow key={order.id} order={order} maxVol={maxVol} />
        ))}
      </div>

      {/* Current Price */}
      <div className="py-2 px-3 my-1 bg-slate-800 border-y border-slate-700 text-center">
        <span className="text-lg font-bold text-white font-mono">
          {currentPrice.toFixed(2)} 
          <span className="text-xs text-muted ml-2">USD</span>
        </span>
      </div>

      {/* Buys (Bids) */}
      <div className="flex-1 overflow-y-auto">
        {buys.map((order) => (
          <OrderRow key={order.id} order={order} maxVol={maxVol} />
        ))}
      </div>
    </div>
  );
};