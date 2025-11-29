import React from 'react';

export const HomePage: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background text-text">
       {/* Hero Section */}
       <div className="relative bg-slate-900 py-20 px-6 text-center border-b border-slate-800">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 tracking-tight">
            The Future of Decentralized Trading
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience institutional-grade execution, deep liquidity, and non-custodial security. Nexus DEX Pro bridges the gap between traditional finance and DeFi.
          </p>
          <button 
            onClick={onNavigate}
            className="bg-primary hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 ring-1 ring-white/10"
          >
            Launch Exchange
          </button>
       </div>

       {/* Investment Plans / ROI Section */}
       <div className="py-16 px-6 max-w-7xl mx-auto w-full">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Grow Your Assets</h2>
                <p className="text-slate-400">Choose from our curated investment plans with competitive APY.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan 1 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded">POPULAR</span>
                            <span className="text-[10px] text-slate-400 border border-slate-600 px-2 py-0.5 rounded">RISK: LOW</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">USDC Savings</h3>
                    <p className="text-sm text-slate-400 mb-6">Low risk stablecoin yield farming via lending protocols.</p>
                    <div className="flex justify-between items-end border-t border-slate-700 pt-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Est. APY</p>
                            <p className="text-2xl font-mono text-emerald-400 font-bold">5.8%</p>
                        </div>
                        <button onClick={() => alert('Investment pool selected.')} className="text-sm font-bold text-white bg-slate-700 hover:bg-emerald-600 px-4 py-2 rounded transition-colors">Stake</button>
                    </div>
                </div>

                {/* Plan 2 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-slate-400 border border-slate-600 px-2 py-0.5 rounded">RISK: MEDIUM</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">ETH Staking</h3>
                    <p className="text-sm text-slate-400 mb-6">Validator node pooling with liquid derivative tokens.</p>
                    <div className="flex justify-between items-end border-t border-slate-700 pt-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Est. APY</p>
                            <p className="text-2xl font-mono text-blue-400 font-bold">4.2%</p>
                        </div>
                        <button onClick={() => alert('Investment pool selected.')} className="text-sm font-bold text-white bg-slate-700 hover:bg-blue-600 px-4 py-2 rounded transition-colors">Stake</button>
                    </div>
                </div>

                {/* Plan 3 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all group cursor-pointer hover:shadow-lg hover:shadow-purple-500/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-500/10 p-3 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">HIGH YIELD</span>
                            <span className="text-[10px] text-slate-400 border border-slate-600 px-2 py-0.5 rounded">RISK: HIGH</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">DeFi Aggregator</h3>
                    <p className="text-sm text-slate-400 mb-6">Automated strategy rotation across lending and liquidity protocols.</p>
                    <div className="flex justify-between items-end border-t border-slate-700 pt-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Est. APY</p>
                            <p className="text-2xl font-mono text-purple-400 font-bold">12.5%</p>
                        </div>
                        <button onClick={() => alert('Investment pool selected.')} className="text-sm font-bold text-white bg-slate-700 hover:bg-purple-600 px-4 py-2 rounded transition-colors">Invest</button>
                    </div>
                </div>
            </div>
       </div>

       {/* Stats/Features Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-20 max-w-7xl mx-auto w-full bg-slate-900/50">
          <div className="bg-surface p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
             <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
               <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
             </div>
             <h3 className="text-2xl font-bold text-slate-200 mb-3">High-Frequency Engine</h3>
             <p className="text-slate-400 leading-relaxed">Matching 100,000+ orders per second with sub-millisecond latency. Built for pros who demand speed and precision.</p>
          </div>
          <div className="bg-surface p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
             <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
               <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <h3 className="text-2xl font-bold text-slate-200 mb-3">Non-Custodial Security</h3>
             <p className="text-slate-400 leading-relaxed">Your funds, your keys. Connect your wallet and trade directly without depositing assets to a central authority.</p>
          </div>
          <div className="bg-surface p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
             <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
               <svg className="w-7 h-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             </div>
             <h3 className="text-2xl font-bold text-slate-200 mb-3">Deep Liquidity</h3>
             <p className="text-slate-400 leading-relaxed">Aggregated liquidity from top market makers ensures minimal slippage on large orders, regardless of market conditions.</p>
          </div>
       </div>

       {/* About Company */}
       <div className="bg-slate-900 py-20 px-8 border-t border-slate-800 mt-auto">
          <div className="max-w-4xl mx-auto text-center">
             <h2 className="text-3xl font-bold text-white mb-8">About Nexus Protocol</h2>
             <p className="text-lg text-slate-400 leading-relaxed mb-10">
               Founded in 2024, Nexus Protocol is dedicated to democratizing access to sophisticated financial tools. We believe in a world where financial markets are open, transparent, and accessible to everyone, regardless of geography or status. Our team consists of veteran blockchain engineers and Wall Street quants working together to build the financial infrastructure of tomorrow.
             </p>
             <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold">
                <a href="#" className="text-slate-500 hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-500 hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-500 hover:text-primary transition-colors">API Documentation</a>
                <a href="#" className="text-slate-500 hover:text-primary transition-colors">Fees</a>
                <a href="#" className="text-slate-500 hover:text-primary transition-colors">Support</a>
             </div>
             <p className="mt-8 text-xs text-slate-600">© 2024 Nexus Protocol. All rights reserved.</p>
          </div>
       </div>
    </div>
  );
};