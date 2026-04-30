import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. AI features require an API key.");
    }
    
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const MODELS = ["gemini-3.1-pro-preview", "gemini-3.1-flash-lite-preview"];

async function generateContentWithRetry(ai: GoogleGenAI, contents: any, config: any) {
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      return response.text;
    } catch (error: any) {
      if (error.status === 429 || (error.message && error.message.includes('429'))) {
        console.warn(`Model ${model} failed with quota exceeded. Trying next...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("All models failed due to quota or other issues.");
}

export const generateGameCode = async (prompt: string, history: ChatMessage[]) => {
  const ai = getAI();
  
  const systemInstruction = `You are a world-class Game Developer and AI Coding Assistant. 
Your task is to help the user build a game from scratch or modify an existing one.
You support both 2D (Canvas API) and 3D (Three.js) game development.

CRITICAL INSTRUCTIONS FOR UPDATING CODE:
1. Only update the "specified part" requested by the user.
2. Return code in blocks prefixed with 'FILE: filename'. To create a new file, just use a new filename.
3. Be EXTREMELY concise. Avoid long explanations. Focus on the code.`;

  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  // Add the current prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  return await generateContentWithRetry(ai, contents, {
    systemInstruction,
    temperature: 0.7,
  });
};

export const getPlan = async (gameDescription: string) => {
  const ai = getAI();
  
  const prompt = `Create a detailed development plan for the following game concept: "${gameDescription}". 
Break it down into:
1. Core Mechanics
2. Technical Stack
3. Development Milestones
4. Potential Challenges
Return the plan in Markdown format.`;

  return await generateContentWithRetry(ai, prompt, {
    systemInstruction: "You are a technical project manager for games."
  });
};
