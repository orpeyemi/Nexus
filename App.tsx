
import React, { useEffect, useState, useRef } from 'react';
import { Candle, Order, OrderSide, OrderStatus, OrderType, Trade, User, KYCLevel, InvestmentPlan } from './types';
import { MatchingEngine, generateInitialCandles } from './services/engine';
import { analyzeMarket } from './services/geminiService';
import { CandleChart } from './components/CandleChart';
import { OrderBook } from './components/OrderBook';
import { OrderEntry } from './components/OrderEntry';
import { KycModal } from './components/KycModal';
import { HomePage } from './components/HomePage';
import { ChatSupport } from './components/ChatSupport';
import { InvestmentPanel } from './components/InvestmentPanel';

// --- INITIAL STATE ---
const INITIAL_BALANCE = { USD: 50000, BTC: 0.5, ETH: 10, SOL: 100 };

type View = 'HOME' | 'EXCHANGE';
type Tab = 'OPEN_ORDERS' | 'HISTORY' | 'FUNDS' | 'INVEST';

const App: React.FC = () => {
  // --- CORE STATE ---
  const engineRef = useRef<MatchingEngine>(new MatchingEngine());
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [activeTab, setActiveTab] = useState<Tab>('OPEN_ORDERS');

  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(65000);
  const [user, setUser] = useState<User>({
    id: 'user_123',
    email: 'trader@nexus.com',
    kycLevel: KYCLevel.NONE,
    balances: INITIAL_BALANCE,
    walletAddress: '0x71C...39A2',
    investments: []
  });
  
  // Order Book State
  const [book, setBook] = useState<{buys: Order[], sells: Order[]}>({ buys: [], sells: [] });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // UI State
  const [isKycOpen, setKycOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived State
  // Mock prices for other assets to calculate total portfolio
  const ethPrice = 3450;
  const solPrice = 148;
  const portfolioValue = 
    user.balances.USD + 
    (user.balances.BTC * currentPrice) + 
    (user.balances.ETH * ethPrice) + 
    (user.balances.SOL * solPrice);

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Generate History
    const initialCandles = generateInitialCandles(100, 65000);
    setCandles(initialCandles);
    setCurrentPrice(initialCandles[initialCandles.length - 1].close);

    // 2. Populate Mock Order Book
    const engine = engineRef.current;
    for(let i=0; i<20; i++) {
        const base = 65000;
        // Asks
        engine.placeOrder({
            id: `ask_${i}`, userId: 'bot', symbol: 'BTCUSD', side: OrderSide.SELL, type: OrderType.LIMIT,
            price: base + (Math.random() * 500), quantity: Math.random() * 2, filledQuantity: 0, timestamp: Date.now(), status: OrderStatus.OPEN
        });
        // Bids
        engine.placeOrder({
            id: `bid_${i}`, userId: 'bot', symbol: 'BTCUSD', side: OrderSide.BUY, type: OrderType.LIMIT,
            price: base - (Math.random() * 500), quantity: Math.random() * 2, filledQuantity: 0, timestamp: Date.now(), status: OrderStatus.OPEN
        });
    }
    setBook(engine.getOrderBook());
  }, []);

  // --- MARKET TICKER LOOP (Simulates WebSocket) ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Random Walk Price
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 20; // Small volatility
        const newPrice = prev + change;

        // 2. Update Candle (simplified: just updating close of last candle for fluidity)
        setCandles(prevCandles => {
            const last = prevCandles[prevCandles.length - 1];
            const updatedLast = {
                ...last,
                close: newPrice,
                high: Math.max(last.high, newPrice),
                low: Math.min(last.low, newPrice),
                volume: last.volume + Math.random()
            };
            // Every 60 ticks, new candle (simulated fast for demo)
            if (Date.now() - last.time > 5000) { 
                return [...prevCandles, {
                    time: Date.now(), open: newPrice, close: newPrice, high: newPrice, low: newPrice, volume: 0
                }];
            }
            return [...prevCandles.slice(0, -1), updatedLast];
        });

        return newPrice;
      });

      // 3. Bot Trading to keep book alive
      if (Math.random() > 0.7) {
        const side = Math.random() > 0.5 ? OrderSide.BUY : OrderSide.SELL;
        const offset = (Math.random() * 50);
        const price = side === OrderSide.BUY ? currentPrice - offset : currentPrice + offset;
        engineRef.current.placeOrder({
             id: `bot_${Date.now()}`, userId: 'bot', symbol: 'BTCUSD', side, type: OrderType.LIMIT,
             price, quantity: Math.random(), filledQuantity: 0, timestamp: Date.now(), status: OrderStatus.OPEN
        });
        setBook(engineRef.current.getOrderBook());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  // --- HANDLERS ---
  const handlePlaceOrder = (side: OrderSide, type: OrderType, price: number, amount: number) => {
    const newOrder: Order = {
        id: `ord_${Date.now()}`,
        userId: user.id,
        symbol: 'BTCUSD',
        side,
        type,
        price,
        quantity: amount,
        filledQuantity: 0,
        timestamp: Date.now(),
        status: OrderStatus.OPEN
    };

    // Optimistic UI Update
    setUserOrders(prev => [newOrder, ...prev]);

    // Send to Engine
    const { filledOrders, newTrade } = engineRef.current.placeOrder(newOrder);

    // Handle Balance Updates & Trade Logs
    if (newTrade) {
        setTrades(prev => [newTrade, ...prev]);
        setUser(prev => {
            const cost = newTrade.price * newTrade.quantity;
            return {
                ...prev,
                balances: {
                    ...prev.balances,
                    USD: side === OrderSide.BUY ? prev.balances.USD - cost : prev.balances.USD + cost,
                    BTC: side === OrderSide.BUY ? prev.balances.BTC + newTrade.quantity : prev.balances.BTC - newTrade.quantity
                }
            };
        });
    }

    setBook(engineRef.current.getOrderBook());
  };

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeMarket('BTCUSD', candles);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  const handleAssetAction = (asset: string, action: 'DEPOSIT' | 'WITHDRAW') => {
    const amount = asset === 'USD' ? 1000 : 1;
    
    if (action === 'DEPOSIT') {
        setUser(prev => ({
            ...prev,
            balances: {
                ...prev.balances,
                [asset]: (prev.balances as any)[asset] + amount
            }
        }));
        alert(`Successfully deposited ${amount} ${asset} via mocked payment gateway.`);
    } else {
        if ((user.balances as any)[asset] < amount) {
            alert("Insufficient funds for withdrawal.");
            return;
        }
        setUser(prev => ({
            ...prev,
            balances: {
                ...prev.balances,
                [asset]: (prev.balances as any)[asset] - amount
            }
        }));
        alert(`Successfully withdrew ${amount} ${asset} to external wallet.`);
    }
  };

  const handleInvest = (plan: InvestmentPlan, amount: number) => {
    // Check balance
    if (user.balances[plan.asset] < amount) {
        alert("Insufficient balance for this investment.");
        return;
    }

    // Deduct balance
    setUser(prev => ({
        ...prev,
        balances: {
            ...prev.balances,
            [plan.asset]: prev.balances[plan.asset] - amount
        },
        investments: [
            ...prev.investments,
            {
                id: `inv_${Date.now()}`,
                planId: plan.id,
                planName: plan.name,
                amount: amount,
                asset: plan.asset,
                timestamp: Date.now(),
                apy: plan.apy
            }
        ]
    }));
    alert(`Successfully committed ${amount} ${plan.asset} to ${plan.name}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-screen bg-background text-text overflow-hidden font-sans">
        {/* HEADER */}
        <header className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-900 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-8">
                <div 
                    className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setCurrentView('HOME')}
                >
                    NEXUS <span className="font-light text-slate-400">PRO</span>
                </div>
                
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    <button 
                        onClick={() => setCurrentView('HOME')} 
                        className={`${currentView === 'HOME' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
                    >
                        Home
                    </button>
                    <button 
                        onClick={() => setCurrentView('EXCHANGE')} 
                        className={`${currentView === 'EXCHANGE' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
                    >
                        Exchange
                    </button>
                    <button className="text-slate-400 hover:text-white transition-colors cursor-not-allowed">Markets</button>
                    <button className="text-slate-400 hover:text-white transition-colors cursor-not-allowed">Learn</button>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                {currentView === 'EXCHANGE' && (
                    <div className="hidden lg:flex gap-4 text-sm font-mono mr-4 border-r border-slate-700 pr-4">
                        <span className="text-slate-200">BTC/USD <span className="text-emerald-400 ml-1">${currentPrice.toFixed(2)}</span></span>
                    </div>
                )}
                
                {/* Wallet & Portfolio Display */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Portfolio Value */}
                    <div className="flex flex-col items-end leading-tight">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Est. Value</span>
                        <span className="text-sm font-bold text-slate-100 font-mono">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-2 bg-slate-800 rounded-full pl-3 pr-2 py-1.5 border border-slate-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-slate-300">{user.walletAddress}</span>
                        <button 
                            onClick={() => copyToClipboard(user.walletAddress)}
                            className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                            title="Copy Address"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2V5a2 2 0 012-2h4.586" />
                            </svg>
                        </button>
                    </div>
                </div>

                {user.kycLevel === KYCLevel.NONE ? (
                    <button 
                        onClick={() => setKycOpen(true)}
                        className="bg-danger/20 text-danger border border-danger/50 px-3 py-1.5 rounded text-xs font-bold animate-pulse hover:bg-danger/30 transition-colors"
                    >
                        Verify Identity
                    </button>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded border border-success/20 text-xs font-bold">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Verified
                    </div>
                )}

                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600 shadow-inner">
                    <span className="text-xs font-bold text-slate-200">U</span>
                </div>
            </div>
        </header>

        {/* CONTENT RENDER */}
        {currentView === 'HOME' ? (
            <HomePage onNavigate={() => setCurrentView('EXCHANGE')} />
        ) : (
            <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-1 p-1 overflow-hidden">
                {/* LEFT: CHART & TABS */}
                <section className="col-span-12 md:col-span-9 flex flex-col gap-1 h-full min-h-0">
                    {/* CHART */}
                    <div className="flex-1 relative min-h-[400px]">
                        <CandleChart data={candles} />
                        {/* AI ANALYST OVERLAY */}
                        <div className="absolute top-16 left-4 max-w-sm z-10 pointer-events-none">
                            <div className="bg-slate-900/90 backdrop-blur border border-indigo-500/30 rounded p-3 shadow-2xl pointer-events-auto">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                                        Gemini Market Insight
                                    </h4>
                                    <button 
                                        onClick={handleAIAnalyze}
                                        disabled={isAnalyzing}
                                        className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded shadow-sm"
                                    >
                                        {isAnalyzing ? 'Thinking...' : 'Analyze'}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    {aiInsight || "Click analyze to generate real-time technical analysis based on current chart patterns."}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* BOTTOM PANEL: TABS */}
                    <div className="h-64 bg-surface rounded border border-slate-700 overflow-hidden flex flex-col">
                         {/* TABS HEADER */}
                         <div className="flex border-b border-slate-700 bg-slate-900/50">
                            {['OPEN_ORDERS', 'HISTORY', 'FUNDS', 'INVEST'].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab as Tab)}
                                    className={`px-6 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                                        activeTab === tab ? 'border-primary text-white bg-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                                >
                                    {tab === 'OPEN_ORDERS' && 'Open Orders'}
                                    {tab === 'HISTORY' && 'Trade History'}
                                    {tab === 'FUNDS' && 'Funds'}
                                    {tab === 'INVEST' && 'Investment Strategies'}
                                </button>
                            ))}
                         </div>

                         {/* CONTENT AREA */}
                         <div className="flex-1 overflow-auto bg-slate-900/30">
                            {activeTab === 'OPEN_ORDERS' && (
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Time</th>
                                            <th className="px-4 py-3 font-medium">Symbol</th>
                                            <th className="px-4 py-3 font-medium">Type</th>
                                            <th className="px-4 py-3 font-medium">Side</th>
                                            <th className="px-4 py-3 font-medium text-right">Price</th>
                                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                                            <th className="px-4 py-3 font-medium text-right">Filled</th>
                                            <th className="px-4 py-3 font-medium text-center">Status</th>
                                            <th className="px-4 py-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userOrders.map(o => (
                                            <tr key={o.id} className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-2.5 text-slate-400 font-mono">{new Date(o.timestamp).toLocaleTimeString()}</td>
                                                <td className="px-4 py-2.5 font-bold text-slate-200">{o.symbol}</td>
                                                <td className="px-4 py-2.5 text-slate-300">{o.type}</td>
                                                <td className={`px-4 py-2.5 font-bold ${o.side === OrderSide.BUY ? 'text-emerald-500' : 'text-rose-500'}`}>{o.side}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-200">{o.price.toFixed(2)}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-200">{o.quantity.toFixed(4)}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-400">{(o.filledQuantity/o.quantity * 100).toFixed(0)}%</td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${o.status === OrderStatus.FILLED ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    {o.status === OrderStatus.OPEN && <button className="text-rose-500 hover:text-rose-400 font-medium">Cancel</button>}
                                                </td>
                                            </tr>
                                        ))}
                                        {userOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="text-center py-12 text-slate-500 italic">No open orders</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'HISTORY' && (
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Time</th>
                                            <th className="px-4 py-3 font-medium">Symbol</th>
                                            <th className="px-4 py-3 font-medium text-right">Price</th>
                                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                                            <th className="px-4 py-3 font-medium text-right">Transaction Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trades.map(t => (
                                            <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-2.5 text-slate-400 font-mono">{new Date(t.timestamp).toLocaleTimeString()}</td>
                                                <td className="px-4 py-2.5 font-bold text-slate-200">{t.symbol}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-200">{t.price.toFixed(2)}</td>
                                                <td className={`px-4 py-2.5 text-right font-mono font-bold ${t.takerSide === OrderSide.BUY ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {t.takerSide === OrderSide.BUY ? '+' : '-'}{t.quantity.toFixed(4)}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono text-blue-400 hover:text-blue-300 cursor-pointer" title={t.txHash}>
                                                    {t.txHash}
                                                </td>
                                            </tr>
                                        ))}
                                        {trades.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-12 text-slate-500 italic">No trade history available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'FUNDS' && (
                                <div className="p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {Object.entries(user.balances).map(([asset, amount]) => (
                                            <div key={asset} className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-all shadow-lg">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-bold text-xl text-white tracking-wide">{asset}</span>
                                                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-full border border-slate-800">Available</span>
                                                </div>
                                                <div className="font-mono text-2xl text-emerald-400 font-bold mb-1">
                                                    {asset === 'USD' ? '$' : ''}{amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                                </div>
                                                <div className="text-xs text-slate-500 mb-6">
                                                    {asset !== 'USD' ? `≈ $${(amount * (asset === 'BTC' ? currentPrice : asset === 'ETH' ? ethPrice : solPrice)).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : 'Fiat Currency'}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button 
                                                        onClick={() => handleAssetAction(asset, 'DEPOSIT')}
                                                        className="bg-primary hover:bg-blue-600 text-white py-2 rounded text-xs font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
                                                    >
                                                        Deposit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAssetAction(asset, 'WITHDRAW')}
                                                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded text-xs font-bold transition-all transform active:scale-95 border border-slate-600"
                                                    >
                                                        Withdraw
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'INVEST' && (
                                <InvestmentPanel 
                                    balance={user.balances} 
                                    onInvest={handleInvest}
                                    activeInvestments={user.investments}
                                />
                            )}
                         </div>
                    </div>
                </section>

                {/* RIGHT: ORDER BOOK & ENTRY */}
                <section className="col-span-12 md:col-span-3 flex flex-col gap-1 h-full min-h-0">
                    <div className="flex-1 min-h-0 shadow-sm">
                        <OrderBook buys={book.buys} sells={book.sells} currentPrice={currentPrice} />
                    </div>
                    <div className="h-auto shadow-sm">
                        <OrderEntry 
                            onPlaceOrder={handlePlaceOrder} 
                            currentPrice={currentPrice}
                            balance={user.balances}
                            kycLevel={user.kycLevel}
                            openKyc={() => setKycOpen(true)}
                        />
                    </div>
                </section>
            </main>
        )}

        <KycModal 
            isOpen={isKycOpen} 
            onClose={() => setKycOpen(false)} 
            onVerify={(level) => setUser(prev => ({ ...prev, kycLevel: level }))}
        />

        {/* Support Chatbot */}
        <ChatSupport />
    </div>
  );
};

export default App;
