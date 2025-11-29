
import React, { useState } from 'react';
import { InvestmentPlan, UserBalance, UserInvestment } from '../types';

interface InvestmentPanelProps {
    balance: UserBalance;
    onInvest: (plan: InvestmentPlan, amount: number) => void;
    activeInvestments: UserInvestment[];
}

const PLANS: InvestmentPlan[] = [
    {
        id: 'plan_usdc',
        name: 'USDC Yield Savings',
        risk: 'LOW',
        apy: 5.8,
        asset: 'USD',
        minAmount: 100,
        description: 'Stable yield generation via over-collateralized lending protocols.'
    },
    {
        id: 'plan_eth',
        name: 'ETH Staking Pool',
        risk: 'MEDIUM',
        apy: 4.2,
        asset: 'ETH',
        minAmount: 0.1,
        description: 'Pooled validation staking rewards with liquid derivative capability.'
    },
    {
        id: 'plan_defi',
        name: 'DeFi High-Yield Aggregator',
        risk: 'HIGH',
        apy: 12.5,
        asset: 'USD',
        minAmount: 500,
        description: 'Automated strategy rotation across emerging liquidity pools.'
    }
];

export const InvestmentPanel: React.FC<InvestmentPanelProps> = ({ balance, onInvest, activeInvestments }) => {
    const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
    const [amount, setAmount] = useState<string>('');

    const handleCommit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan) return;
        const val = parseFloat(amount);
        if (val > 0 && val >= selectedPlan.minAmount) {
            onInvest(selectedPlan, val);
            setAmount('');
            setSelectedPlan(null);
        } else {
            alert(`Minimum investment is ${selectedPlan.minAmount} ${selectedPlan.asset}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/30 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-0">
                
                {/* Available Plans */}
                <div className="p-4 overflow-y-auto border-r border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 sticky top-0 bg-slate-900/90 py-2 z-10 backdrop-blur">Available Strategies</h3>
                    <div className="space-y-4">
                        {PLANS.map(plan => (
                            <div 
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    selectedPlan?.id === plan.id 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white">{plan.name}</h4>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                            plan.risk === 'LOW' ? 'border-emerald-500/50 text-emerald-400' :
                                            plan.risk === 'MEDIUM' ? 'border-blue-500/50 text-blue-400' :
                                            'border-purple-500/50 text-purple-400'
                                        }`}>{plan.risk} RISK</span>
                                        <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">{plan.asset}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mb-4">{plan.description}</p>
                                <div className="flex justify-between items-center">
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-500">APY</div>
                                        <div className="text-lg font-mono font-bold text-emerald-400">{plan.apy}%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-500">Min. Entry</div>
                                        <div className="text-sm font-mono text-slate-200">{plan.minAmount} {plan.asset}</div>
                                    </div>
                                    <button className={`px-4 py-2 rounded text-xs font-bold transition-colors ${
                                        selectedPlan?.id === plan.id ? 'bg-primary text-white' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        {selectedPlan?.id === plan.id ? 'Selected' : 'Select'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Action & Active Investments */}
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Input Section */}
                    <div className="p-4 border-b border-slate-700 bg-slate-800/20">
                        <h3 className="text-sm font-bold text-slate-300 mb-4">Commit Funds</h3>
                        {selectedPlan ? (
                            <form onSubmit={handleCommit} className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Amount to Invest ({selectedPlan.asset})</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-primary outline-none"
                                            placeholder={`Min ${selectedPlan.minAmount}`}
                                        />
                                        <button type="submit" className="bg-success hover:bg-emerald-600 text-white px-6 rounded font-bold text-sm transition-colors">
                                            Confirm
                                        </button>
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                                        <span>Available: {balance[selectedPlan.asset as keyof UserBalance].toFixed(4)} {selectedPlan.asset}</span>
                                        <span>Proj. Daily: {amount ? (parseFloat(amount) * (selectedPlan.apy/100) / 365).toFixed(4) : '0.00'} {selectedPlan.asset}</span>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-6 text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-lg">
                                Select a strategy on the left to start investing
                            </div>
                        )}
                    </div>

                    {/* Active Investments List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <h3 className="text-sm font-bold text-slate-300 mb-4">Active Positions</h3>
                        {activeInvestments.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 text-xs italic">
                                No active investments found.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeInvestments.map(inv => (
                                    <div key={inv.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-sm text-white mb-0.5">{inv.planName}</div>
                                            <div className="text-[10px] text-slate-400">{new Date(inv.timestamp).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-sm text-slate-200 font-bold">{inv.amount.toFixed(2)} {inv.asset}</div>
                                            <div className="text-[10px] text-emerald-400">+{(inv.amount * (inv.apy/100)/365).toFixed(4)} pending</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
