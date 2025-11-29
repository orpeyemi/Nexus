
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT'
}

export enum OrderStatus {
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  quantity: number;
  filledQuantity: number;
  timestamp: number;
  status: OrderStatus;
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  timestamp: number;
  takerSide: OrderSide; // Who initiated the trade
  txHash: string; // Simulated blockchain hash
}

export interface Candle {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface UserBalance {
  USD: number;
  BTC: number;
  ETH: number;
  SOL: number;
}

export enum KYCLevel {
  NONE = 0,
  TIER_1 = 1, // Basic Info
  TIER_2 = 2  // Enhanced (Docs)
}

export interface InvestmentPlan {
  id: string;
  name: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  apy: number;
  asset: keyof UserBalance;
  minAmount: number;
  description: string;
}

export interface UserInvestment {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  asset: keyof UserBalance;
  timestamp: number;
  apy: number;
}

export interface User {
  id: string;
  email: string;
  kycLevel: KYCLevel;
  balances: UserBalance;
  walletAddress: string; // Simulated Non-custodial key
  investments: UserInvestment[];
}
