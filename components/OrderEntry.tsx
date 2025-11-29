import React, { useState } from 'react';
import { OrderSide, OrderType, UserBalance } from '../types';

interface OrderEntryProps {
  onPlaceOrder: (side: OrderSide, type: OrderType, price: number, amount: number) => void;
  currentPrice: number;
  balance: UserBalance;
  kycLevel: number;
  openKyc: () => void;
}

export const OrderEntry: React.FC<OrderEntryProps> = ({ onPlaceOrder, currentPrice, balance, kycLevel, openKyc }) => {
  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const [type, setType] = useState<OrderType>(OrderType.LIMIT);
  const [price, setPrice] = useState<string>(currentPrice.toFixed(2));
  const [amount, setAmount] = useState<string>('');

  const isBuy = side === OrderSide.BUY;
  const numPrice = type === OrderType.MARKET ? currentPrice : parseFloat(price) || 0;
  const numAmount = parseFloat(amount) || 0;
  const total = numPrice * numAmount;
  const fee = total * 0.001; // 0.1% fee

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kycLevel === 0) {
      openKyc();
      return;
    }
    if (numAmount > 0) {
      onPlaceOrder(side, type, numPrice, numAmount);
      setAmount('');
    }
  };

  return (
    <div className="p-4 bg-surface border-l border-t border-slate-700 flex flex-col h-full">
      {/* Side Toggle */}
      <div className="flex mb-4 bg-slate-900 rounded p-1">
        <button 
          onClick={() => setSide(OrderSide.BUY)}
          className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${isBuy ? 'bg-emerald-600 text-white' : 'text-muted hover:text-white'}`}
        >
          Buy
        </button>
        <button 
          onClick={() => setSide(OrderSide.SELL)}
          className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${!isBuy ? 'bg-rose-600 text-white' : 'text-muted hover:text-white'}`}
        >
          Sell
        </button>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-4 mb-4 text-xs font-mono">
        <button onClick={() => setType(OrderType.LIMIT)} className={type === OrderType.LIMIT ? 'text-primary font-bold' : 'text-muted'}>Limit</button>
        <button onClick={() => setType(OrderType.MARKET)} className={type === OrderType.MARKET ? 'text-primary font-bold' : 'text-muted'}>Market</button>
        <button className="text-muted cursor-not-allowed" disabled>Stop-Limit</button>
      </div>

      {/* Inputs */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {type === OrderType.LIMIT && (
          <div>
            <label className="block text-xs text-muted mb-1">Price (USD)</label>
            <div className="relative">
                <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-right text-sm focus:border-primary outline-none"
                />
                <span className="absolute left-3 top-2 text-muted text-xs">USD</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs text-muted mb-1">Amount (BTC)</label>
          <div className="relative">
            <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-right text-sm focus:border-primary outline-none"
                step="0.0001"
            />
            <span className="absolute left-3 top-2 text-muted text-xs">BTC</span>
          </div>
        </div>

        {/* Slider Mock */}
        <div className="flex gap-1 h-1 bg-slate-800 rounded overflow-hidden my-2">
            {[25, 50, 75, 100].map(pct => (
                <div key={pct} className="flex-1 bg-slate-700 hover:bg-primary cursor-pointer" onClick={() => {
                    if (isBuy) {
                         // Max buy
                         setAmount(((balance.USD * (pct/100)) / numPrice).toFixed(4));
                    } else {
                        setAmount((balance.BTC * (pct/100)).toFixed(4));
                    }
                }} />
            ))}
        </div>

        {/* Summary */}
        <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs text-muted">
                <span>Avail Balance</span>
                <span>{isBuy ? `${balance.USD.toFixed(2)} USD` : `${balance.BTC.toFixed(4)} BTC`}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
                <span>Fee (0.1%)</span>
                <span>{fee.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-200">
                <span>Total</span>
                <span>{total.toFixed(2)} USD</span>
            </div>
        </div>

        <button 
          type="submit"
          className={`w-full py-3 rounded font-bold text-white transition-all transform active:scale-95 ${
            isBuy ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
          }`}
        >
          {kycLevel > 0 
            ? `${isBuy ? 'Buy' : 'Sell'} BTC` 
            : 'Verify Identity to Trade'}
        </button>
      </form>
    </div>
  );
};