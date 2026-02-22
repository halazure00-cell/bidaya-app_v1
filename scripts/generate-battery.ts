import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateBatteryImage() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not found');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    console.log('Generating battery image...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using Flash Image as it's more likely to be available in this env without user interaction
      contents: {
        parts: [
          {
            text: 'A highly realistic and beautiful illustration of a vertical glass battery container. The battery is filled with glowing dusty gold liquid energy, framed with elegant emerald green metallic accents. High quality, 4k, cinematic lighting, transparent glass texture, isolated on white background, minimal design.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.inlineData) {
      const base64Data = candidate.content.parts[0].inlineData.data;
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(path.join(publicDir, 'battery-skin.png'), buffer);
      console.log('Battery image saved to public/battery-skin.png');
    } else {
      console.error('No image data in response');
    }
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

generateBatteryImage();
