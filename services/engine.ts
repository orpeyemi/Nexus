import { Candle, Order, OrderSide, OrderStatus, OrderType, Trade } from '../types';

/**
 * SIMULATED BACKEND ENGINE
 * In a real app, this would be a NestJS microservice utilizing Redis for queues
 * and PostgreSQL for persistence.
 */

// --- Market Data Simulation (Random Walk) ---
export const generateInitialCandles = (count: number, startPrice: number): Candle[] => {
  const candles: Candle[] = [];
  let currentPrice = startPrice;
  const now = Date.now();
  const timeframe = 60 * 1000; // 1 minute

  for (let i = count; i > 0; i--) {
    const time = now - i * timeframe;
    const volatility = currentPrice * 0.002;
    const change = (Math.random() - 0.5) * volatility;
    
    const open = currentPrice;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 10 + 1;

    candles.push({ time, open, high, low, close, volume });
    currentPrice = close;
  }
  return candles;
};

// --- Order Matching Engine Logic ---

export class MatchingEngine {
  private buyBook: Order[] = [];
  private sellBook: Order[] = [];
  private trades: Trade[] = [];

  constructor() {}

  public getOrderBook() {
    // Sort for display: Buys (Highest first), Sells (Lowest first)
    const buys = [...this.buyBook].sort((a, b) => b.price - a.price).slice(0, 15);
    const sells = [...this.sellBook].sort((a, b) => a.price - b.price).slice(0, 15);
    return { buys, sells };
  }

  public placeOrder(order: Order): { filledOrders: Order[], newTrade: Trade | null } {
    let newTrade: Trade | null = null;
    const filledOrders: Order[] = [];

    if (order.side === OrderSide.BUY) {
      // Attempt to match with lowest sells
      this.sellBook.sort((a, b) => a.price - b.price); // Ascending

      // In a real engine, we iterate until filled or no liquidity
      // Simplified: Try to match the best price immediately
      const bestAsk = this.sellBook[0];

      if (bestAsk && (order.type === OrderType.MARKET || bestAsk.price <= order.price)) {
        // MATCH FOUND
        const tradePrice = bestAsk.price;
        const tradeQty = Math.min(order.quantity, bestAsk.quantity);

        newTrade = this.createTrade(order.symbol, tradePrice, tradeQty, OrderSide.BUY);
        
        // Update Order
        order.filledQuantity += tradeQty;
        order.status = order.filledQuantity >= order.quantity ? OrderStatus.FILLED : OrderStatus.PARTIAL;

        // Update Ask
        bestAsk.filledQuantity += tradeQty;
        bestAsk.status = bestAsk.filledQuantity >= bestAsk.quantity ? OrderStatus.FILLED : OrderStatus.PARTIAL;

        if (bestAsk.status === OrderStatus.FILLED) {
            this.sellBook.shift(); // Remove filled order
        }
      }

      if (order.status !== OrderStatus.FILLED && order.type === OrderType.LIMIT) {
        this.buyBook.push(order);
      }

    } else {
      // SELL SIDE
      // Attempt to match with highest buys
      this.buyBook.sort((a, b) => b.price - a.price); // Descending

      const bestBid = this.buyBook[0];

      if (bestBid && (order.type === OrderType.MARKET || bestBid.price >= order.price)) {
         // MATCH FOUND
         const tradePrice = bestBid.price;
         const tradeQty = Math.min(order.quantity, bestBid.quantity);
 
         newTrade = this.createTrade(order.symbol, tradePrice, tradeQty, OrderSide.SELL);

         // Update Order
         order.filledQuantity += tradeQty;
         order.status = order.filledQuantity >= order.quantity ? OrderStatus.FILLED : OrderStatus.PARTIAL;

         // Update Bid
         bestBid.filledQuantity += tradeQty;
         bestBid.status = bestBid.filledQuantity >= bestBid.quantity ? OrderStatus.FILLED : OrderStatus.PARTIAL;

         if (bestBid.status === OrderStatus.FILLED) {
             this.buyBook.shift(); // Remove filled order
         }
      }

      if (order.status !== OrderStatus.FILLED && order.type === OrderType.LIMIT) {
        this.sellBook.push(order);
      }
    }

    return { filledOrders, newTrade };
  }

  private createTrade(symbol: string, price: number, quantity: number, takerSide: OrderSide): Trade {
    const trade: Trade = {
      id: Math.random().toString(36).substring(7),
      symbol,
      price,
      quantity,
      timestamp: Date.now(),
      takerSide,
      txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    this.trades.unshift(trade);
    return trade;
  }
}
