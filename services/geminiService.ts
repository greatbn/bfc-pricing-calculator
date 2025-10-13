import { GoogleGenAI, Type } from "@google/genai";
import type { EstimateItem, ServiceId } from '../types';

const availableServices: ServiceId[] = [
    'CloudServer', 'Database', 'SimpleStorage', 'BlockStorage', 'LoadBalancer', 'Kubernetes', 'Kafka', 'CallCenter', 'BusinessEmail', 'EmailTransaction', 'LMS', 'WanIp', 'Snapshot', 'BackupSchedule', 'CustomImage'
];

export async function generateEstimateFromInput(promptText: string, imageBase64: string | null, imageMimeType: string | null): Promise<Omit<EstimateItem, 'id'>[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        service: {
          type: Type.STRING,
          description: 'The name of the Bizfly Cloud service.',
          enum: availableServices
        },
        description: {
          type: Type.STRING,
          description: 'A detailed description of the service configuration (e.g., CPU, RAM, storage size, plan name).',
        },
        price: {
          type: Type.NUMBER,
          description: 'The unit price per month for a single item. Do not include currency symbols.',
        },
        quantity: {
          type: Type.INTEGER,
          description: 'The number of units for this item.',
        },
      },
      required: ['service', 'description', 'price', 'quantity']
    }
  };

  const instruction = `You are a Bizfly Cloud cost estimation expert. Analyze the user's request, which may be an image of an invoice/diagram or a text description. Extract all relevant services, their configurations, quantities, and unit prices.
Your task is to populate a JSON array that strictly adheres to the provided schema.
- The 'service' field must be one of the following exact values: ${availableServices.join(', ')}. If the user's term is slightly different (e.g., "VM" or "Virtual Server"), map it to "CloudServer".
- The 'description' should be a concise summary of the configuration details you found.
- The 'price' must be the price for a single unit per month.
- If the user provides a total price for multiple items, calculate the unit price.
- If no price is provided, make a reasonable estimate based on the configuration.
- Do not add any items that are not explicitly mentioned or clearly implied in the user's request.
User's text request: "${promptText}"`;
  
  // FIX: Conditionally construct the parts array to ensure correct type inference for multi-modal input. The original code failed because TypeScript inferred the array type to only contain text parts.
  const contents = {
    parts: imageBase64 && imageMimeType
      ? [
          { text: instruction },
          {
            inlineData: {
              mimeType: imageMimeType,
              data: imageBase64,
            },
          },
        ]
      : [{ text: instruction }],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
          responseMimeType: "application/json",
          responseSchema: schema,
      },
    });
    
    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);

    // The model might return a single object instead of an array if only one item is found
    if (Array.isArray(parsedJson)) {
        return parsedJson;
    } else if (typeof parsedJson === 'object' && parsedJson !== null) {
        return [parsedJson];
    } else {
        return [];
    }
  } catch (error) {
    console.error("Error calling Gemini API for estimation:", error);
    throw new Error("The AI failed to generate a valid estimate. Please try rephrasing your request or check the uploaded image.");
  }
}