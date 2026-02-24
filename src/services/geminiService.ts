import { GoogleGenAI } from "@google/genai";
import { BidayatState } from "../types";

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateDailyNasihat = async (state: BidayatState): Promise<{ arabic: string; translation: string }> => {
  if (!apiKey) {
    throw new Error("API key not found");
  }

  // Analyze state to provide context
  const hasad = state.heartDiseases.find(d => d.name.includes('Hasad'))?.level || 1;
  const riya = state.heartDiseases.find(d => d.name.includes('Riya'))?.level || 1;
  const ujub = state.heartDiseases.find(d => d.name.includes('Ujub'))?.level || 1;
  
  const prayers = state.todayPrayer || { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
  const prayerCount = (prayers.subuh + prayers.dzuhur + prayers.ashar + prayers.maghrib + prayers.isya);

  const prompt = `
    You are a wise Islamic scholar deeply knowledgeable in Imam Al-Ghazali's "Bidayatul Hidayah".
    The user's current spiritual state is:
    - Hasad (Envy) level: ${hasad}/10
    - Riya (Showing off) level: ${riya}/10
    - Ujub (Vanity) level: ${ujub}/10
    - Prayers completed today: ${prayerCount}/5

    Based on this state, provide a short, profound piece of advice (Nasihat) for the user.
    If a disease level is high (>6), focus on curing that disease.
    If prayers are low, encourage them gently.
    
    Return the response strictly in JSON format with two properties:
    1. "arabic": A relevant short Arabic quote, hadith, or Quranic verse (with harakat).
    2. "translation": The Indonesian translation and a brief, personalized advice based on their state (max 2 sentences).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Error generating nasihat:", error);
    throw error;
  }
};

export const createMuhasabahChat = () => {
  if (!apiKey) {
    throw new Error("API key not found");
  }

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `Anda adalah asisten spiritual Islami yang bijaksana, terinspirasi oleh ajaran Imam Al-Ghazali dalam kitab Bidayatul Hidayah. 
      Tugas Anda adalah membantu pengguna melakukan 'Muhasabah' (introspeksi diri). 
      Berikan nasihat yang lembut, menenangkan, namun tegas dalam prinsip syariat. 
      Gunakan bahasa Indonesia yang baik, sopan, dan penuh empati. 
      Sesekali kutip ayat Al-Quran atau Hadits yang relevan (sertakan teks Arab dan artinya jika memungkinkan).
      Jangan memberikan fatwa hukum yang rumit, fokuslah pada penyucian jiwa (Tazkiyatun Nafs) dan perbaikan akhlak.`,
      temperature: 0.7,
    },
  });
};
