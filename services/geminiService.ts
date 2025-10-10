
import { GoogleGenAI } from "@google/genai";
import type { EstimateItem } from '../types';

export async function generateEstimateSummary(items: EstimateItem[]): Promise<string> {
  // FIX: Removed API key check to align with coding guidelines assuming it's always available.
  if (items.length === 0) {
    return "This is a summary of the selected Bizfly Cloud services for your project.";
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const itemsDescription = items.map(item => 
    `- ${item.quantity} x ${item.description} @ ${item.price.toLocaleString('vi-VN')} VNĐ/month each`
  ).join('\n');

  const prompt = `
    You are a cloud solutions consultant.
    A customer has selected the following items for a cost estimate from Bizfly Cloud.
    Write a brief, professional, one-paragraph summary of the proposed infrastructure.
    Do not mention the prices. Start with a phrase like "This estimate outlines..." or "The proposed solution includes...".
    
    Estimated Items:
    ${itemsDescription}
    
    Summary:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Could not generate an AI summary for the estimate.";
  }
}