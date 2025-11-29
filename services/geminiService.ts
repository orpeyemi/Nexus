
import { GoogleGenAI } from "@google/genai";
import { Candle } from "../types";

const ANALYST_SYSTEM_INSTRUCTION = `
You are a senior financial crypto analyst. You provide concise, professional technical analysis based on OHLCV data provided. 
Focus on:
1. Trend identification (Bullish/Bearish).
2. Key Support/Resistance levels.
3. Volatility assessment.
Keep the tone institutional and risk-aware. Max 3 sentences.
`;

const SUPPORT_SYSTEM_INSTRUCTION = `
You are 'Nexus Support', a helpful, professional customer support agent for the Nexus DEX Pro cryptocurrency exchange.
- You assist users with questions about trading, KYC verification, funding, and investment plans.
- If a user asks about account specific issues (like a lost password or specific transaction), ask them to provide their Ticket ID or email, then simulate a polite confirmation that you are checking.
- Keep responses concise (under 50 words) and friendly.
- Do not give financial advice.
`;

export const analyzeMarket = async (symbol: string, candles: Candle[]): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "AI Analysis unavailable: API Key missing.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Format last 10 candles for context
    const recentData = candles.slice(-10).map(c => 
      `[${new Date(c.time).toLocaleTimeString()}] O:${c.open.toFixed(2)} H:${c.high.toFixed(2)} L:${c.low.toFixed(2)} C:${c.close.toFixed(2)} V:${c.volume.toFixed(2)}`
    ).join('\n');

    const prompt = `Analyze the recent market action for ${symbol} based on this 1-minute candle data:\n${recentData}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: ANALYST_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for consistent, analytical output
        maxOutputTokens: 150,
      }
    });

    return response.text || "Analysis pending...";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Market analysis temporarily unavailable.";
  }
};

export const getSupportResponse = async (history: {role: 'user' | 'model', text: string}[], newMessage: string): Promise<string> => {
    try {
        if (!process.env.API_KEY) return "Support system offline (API Key missing).";

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Transform simple history to SDK Content format
        const chatHistory = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: chatHistory,
            config: {
                systemInstruction: SUPPORT_SYSTEM_INSTRUCTION,
            }
        });
        
        const response = await chat.sendMessage({
            message: newMessage
        });

        return response.text || "I'm sorry, I couldn't process that request.";
    } catch (error) {
        console.error("Gemini Support Error:", error);
        return "I am currently experiencing high traffic. Please try again later.";
    }
}
