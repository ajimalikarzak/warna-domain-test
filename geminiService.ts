
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  static async colorizePhotocopy(base64Image: string, customInstruction?: string) {
    const ai = this.getAI();
    
    // Prompt yang sangat spesifik untuk perbaikan dokumen & keterbacaan
    const prompt = `
      DOCUMENT RESTORATION SYSTEM:
      
      CORE TASK: 
      1. DETECT SKEW: Identify the tilt angle of the document in the image.
      2. AUTO-STRAIGHTEN (DESKEW): Rotate and realign the document so it is perfectly vertical/horizontal. Output must be a straight document.
      3. PROPORTIONALITY: Maintain original document aspect ratio but fix any perspective distortion (warp).
      
      TEXT ENHANCEMENT:
      - Scan all numbers and text characters.
      - Convert gray/faded ink to BOLD PURE BLACK (#000000).
      - Ensure maximum contrast against backgrounds.
      - Remove paper grain, noise, and photocopy artifacts.
      
      COLORIZATION STYLE:
      - Use professional digital colors (Excel-like).
      - Header: Navy Blue or Forest Green with White Text.
      - Grid: Dark Gray solid lines.
      - Rows: Clean White or very light gray alternates.
      
      FINAL OUTPUT:
      - A perfectly straight, clear, and professional-looking digital table/document.
      
      ${customInstruction ? `ADDITIONAL USER REQUEST: ${customInstruction}` : ""}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        // Menggunakan parameter untuk menjaga integritas dokumen
        temperature: 0.1,
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("API did not return image data");
  }
}
