
import { GoogleGenAI, Type } from "@google/genai";
import { AIEngine } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AIInsight {
  translation: string;
  explanation: string;
  keyThemes: string[];
}

export interface IsnadAnalysis {
  reliability: string;
  narrators: { name: string; reliability: string; bio: string }[];
  scholarlyNotes: string;
}

const LOCAL_LLM_URL = 'http://localhost:11434/api/generate';

/**
 * Calls a local LLM (like Ollama) if configured.
 * Assumes Ollama is running locally with a model like phi3 or gemma.
 */
const callLocalLLM = async (prompt: string, schema: any): Promise<any> => {
  try {
    const response = await fetch(LOCAL_LLM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:mini', // Defaulting to phi3:mini as requested
        prompt: `${prompt}\n\nStrictly return only the JSON according to this schema: ${JSON.stringify(schema)}`,
        stream: false,
        format: 'json'
      })
    });
    const data = await response.json();
    return JSON.parse(data.response);
  } catch (error) {
    console.error("Local LLM Error (Check if Ollama is running):", error);
    throw new Error("Local LLM Connection Failed. Make sure Ollama is running at localhost:11434.");
  }
};

export const getAIInsight = async (
  text: string, 
  context: string, 
  targetLanguage: string = 'English',
  engine: AIEngine = 'gemini'
): Promise<AIInsight> => {
  const prompt = `Context: ${context}\nContent: ${text}\n\nTranslate the above content to ${targetLanguage} accurately. Also provide a brief spiritual or historical explanation (tafsir/context) and extract key themes. Return the result in JSON format.`;
  const schema = {
    type: "object",
    properties: {
      translation: { type: "string" },
      explanation: { type: "string" },
      keyThemes: { type: "array", items: { type: "string" } }
    },
    required: ["translation", "explanation", "keyThemes"]
  };

  if (engine === 'local') {
    return await callLocalLLM(prompt, schema);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            explanation: { type: Type.STRING },
            keyThemes: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
          },
          required: ["translation", "explanation", "keyThemes"]
        }
      }
    });

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini AI Insight Error:", error);
    throw error;
  }
};

export const analyzeIsnad = async (
  isnad: string, 
  text: string,
  engine: AIEngine = 'gemini'
): Promise<IsnadAnalysis> => {
  const prompt = `Hadith Text: ${text}\nIsnad: ${isnad}\n\nAnalyze this Chain of Narration (Isnad). Identify the narrators, their reliability according to Ilm al-Rijal, and provide scholarly notes on the authenticity. Return in JSON.`;
  const schema = {
    type: "object",
    properties: {
      reliability: { type: "string" },
      narrators: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            reliability: { type: "string" },
            bio: { type: "string" }
          },
          required: ["name", "reliability", "bio"]
        }
      },
      scholarlyNotes: { type: "string" }
    },
    required: ["reliability", "narrators", "scholarlyNotes"]
  };

  if (engine === 'local') {
    return await callLocalLLM(prompt, schema);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reliability: { type: Type.STRING },
            narrators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  reliability: { type: Type.STRING },
                  bio: { type: Type.STRING }
                },
                required: ["name", "reliability", "bio"]
              }
            },
            scholarlyNotes: { type: Type.STRING }
          },
          required: ["reliability", "narrators", "scholarlyNotes"]
        }
      }
    });
    
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Isnad Error:", error);
    throw error;
  }
};
