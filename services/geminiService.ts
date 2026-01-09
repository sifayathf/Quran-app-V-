
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from environment variables.
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

/**
 * Generates spiritual or historical insights for a given text (Ayah or Hadith).
 */
export const getAIInsight = async (text: string, context: string, targetLanguage: string = 'English'): Promise<AIInsight> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${context}\nContent: ${text}\n\nTranslate the above content to ${targetLanguage} accurately. Also provide a brief spiritual or historical explanation (tafsir/context) and extract key themes. Return the result in JSON format.`,
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

    // Directly access the text property as per @google/genai guidelines.
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Insight Error:", error);
    throw error;
  }
};

/**
 * Analyzes the chain of narrators (Isnad) for a Hadith.
 */
export const analyzeIsnad = async (isnad: string, text: string): Promise<IsnadAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Hadith Text: ${text}\nIsnad: ${isnad}\n\nAnalyze this Chain of Narration (Isnad). Identify the narrators, their reliability according to Ilm al-Rijal, and provide scholarly notes on the authenticity. Return in JSON.`,
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
    
    // Directly access the text property as per @google/genai guidelines.
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Isnad Error:", error);
    throw error;
  }
};
