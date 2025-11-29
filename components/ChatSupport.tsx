
import React, { useState, useRef, useEffect } from 'react';
import { getSupportResponse } from '../services/geminiService';

interface Message {
    id: string;
    role: 'user' | 'agent' | 'admin';
    text: string;
    timestamp: number;
}

export const ChatSupport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [mode, setMode] = useState<'AI' | 'HUMAN'>('AI');
    
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'agent', text: 'Hello! I am Nexus AI. How can I help you with your trading today?', timestamp: Date.now() }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleRequestAgent = () => {
        if (mode === 'HUMAN') return;
        
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'agent',
            text: 'Connecting you to a specialist...',
            timestamp: Date.now()
        }]);

        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            setMode('HUMAN');
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'admin',
                text: 'Hi, this is Sarah from the VIP Desk. I see your chat history. How can I assist you further?',
                timestamp: Date.now()
            }]);
        }, 2000);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        if (mode === 'HUMAN') {
            // Simulate Admin Response
            setTimeout(() => {
                const adminMsg: Message = { 
                    id: (Date.now() + 1).toString(), 
                    role: 'admin', 
                    text: "I've flagged that for our technical team. It should be resolved shortly. Is there anything else?", 
                    timestamp: Date.now() 
                };
                setMessages(prev => [...prev, adminMsg]);
                setIsTyping(false);
            }, 1500);
            return;
        }

        // AI Response Logic
        try {
            // Filter and map history for Gemini (only send user and agent/model messages)
            const historyForAi = messages
                .filter(m => m.role !== 'admin') // Exclude admin messages from AI context if any existed from previous sessions
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    text: m.text
                })) as {role: 'user'|'model', text: string}[];

            const replyText = await getSupportResponse(
                historyForAi,
                userMsg.text
            );
            
            const agentMsg: Message = { id: (Date.now() + 1).toString(), role: 'agent', text: replyText, timestamp: Date.now() };
            setMessages(prev => [...prev, agentMsg]);
        } catch (err) {
            const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'agent', text: "Connection error. Please try again.", timestamp: Date.now() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 bg-surface border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {mode === 'AI' ? (
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20">AI</div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-rose-500/20">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                )}
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-slate-900 rounded-full ${mode === 'AI' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-100">{mode === 'AI' ? 'Nexus Assistant' : 'Sarah (Senior Broker)'}</h3>
                                <span className="text-[10px] text-slate-400">{mode === 'AI' ? 'Automated Support' : 'Live Agent Active'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             {mode === 'AI' && (
                                <button 
                                    onClick={handleRequestAgent}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors" 
                                    title="Request Human Agent"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                </button>
                             )}
                            <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-primary text-white rounded-br-none' 
                                        : msg.role === 'admin'
                                            ? 'bg-slate-700 text-slate-100 rounded-bl-none border border-rose-500/30'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                }`}>
                                    {msg.role === 'admin' && <div className="text-[10px] text-rose-400 font-bold mb-1 uppercase tracking-wider">Admin Support</div>}
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-700 flex gap-1 items-center">
                                    <span className="text-[10px] text-slate-500 mr-2">{mode === 'AI' ? 'AI' : 'Agent'} is typing</span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-700">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={mode === 'AI' ? "Ask about trading, KYC, or funds..." : "Type your message to Sarah..."}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary placeholder-slate-500 transition-colors"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </div>
                        <div className="flex justify-between items-center mt-2 px-1">
                            <span className="text-[10px] text-slate-500">
                                {mode === 'AI' ? 'Powered by Gemini AI' : 'Session ID: #8821-XJ'}
                            </span>
                            {mode === 'AI' && (
                                <button 
                                    type="button" 
                                    onClick={handleRequestAgent}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                                >
                                    Speak to human agent
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? 'bg-slate-700' : 'bg-primary'} hover:bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 flex items-center justify-center relative`}
            >
                {isOpen ? (
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                ) : (
                    <>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </>
                )}
            </button>
        </div>
    );
};
