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

export const generateGameCode = async (prompt: string, history: ChatMessage[]) => {
  const model = "gemini-3.1-pro-preview"; 
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

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getPlan = async (gameDescription: string) => {
  const model = "gemini-3.1-pro-preview";
  const ai = getAI();
  
  const prompt = `Create a detailed development plan for the following game concept: "${gameDescription}". 
Break it down into:
1. Core Mechanics
2. Technical Stack
3. Development Milestones
4. Potential Challenges
Return the plan in Markdown format.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a technical project manager for games."
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
