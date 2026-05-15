// Hugging Face AI Helper
// Uses Hugging Face Inference API for content generation
// No local installation needed - works everywhere!

const HF_API_TOKEN = "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";
const HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-small";

async function callHuggingFace(prompt: string): Promise<string> {
  try {
    const response = await fetch(HF_API_URL, {
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API returned error:", response.status, errorText);
      throw new Error(`HF API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Support different Hugging Face response formats
    if (Array.isArray(result) && result.length > 0) {
      return (result[0]?.generated_text || result[0]?.text || "").trim();
    }

    return (result?.generated_text || result?.text || "").trim();
  } catch (error) {
    console.error("Hugging Face API error:", error);
    throw new Error("Failed to generate content. Check your internet connection or Hugging Face API token.");
  }
}

export async function generateGameDescription(gameTitle: string): Promise<string> {
  const prompt = `Write a compelling 2-3 sentence game description for a video game called "${gameTitle}". Make it engaging and suitable for a game store. Only return the description, nothing else.`;
  
  try {
    const response = await callHuggingFace(prompt);
    return response.split("\n")[0].trim() || "An amazing gaming experience awaits.";
  } catch (error) {
    throw error;
  }
}

export async function generateDeveloperName(gameTitle: string): Promise<string> {
  const prompt = `Generate a fictional game studio/publisher name for a game called "${gameTitle}". The name should be creative and professional. Only return the studio name, nothing else. Max 3 words.`;
  
  try {
    const response = await callHuggingFace(prompt);
    return response.split("\n")[0].trim() || "Indie Studios";
  } catch (error) {
    throw error;
  }
}

export async function generateSystemRequirements(gameTitle: string): Promise<{
  minimum: { os: string; processor: string; memory: string; graphics: string; storage: string };
  recommended: { os: string; processor: string; memory: string; graphics: string; storage: string };
}> {
  const prompt = `Generate realistic system requirements for a game called "${gameTitle}". Return ONLY valid JSON in this exact format:
{
  "minimum": {
    "os": "Windows 10 64-bit",
    "processor": "Intel Core i5-8400 or AMD Ryzen 5 2600",
    "memory": "8 GB RAM",
    "graphics": "NVIDIA GTX 1060 or AMD RX 580",
    "storage": "50 GB SSD"
  },
  "recommended": {
    "os": "Windows 11 64-bit",
    "processor": "Intel Core i7-10700K or AMD Ryzen 5 5600X",
    "memory": "16 GB RAM",
    "graphics": "NVIDIA RTX 3060 Ti or AMD RX 6700",
    "storage": "50 GB SSD"
  }
}

Return ONLY the JSON, no other text.`;

  try {
    const response = await callHuggingFace(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-8400",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 1060",
        storage: "50 GB SSD",
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-10700K",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 3060 Ti",
        storage: "50 GB SSD",
      },
    };
  } catch (error) {
    throw error;
  }
}

export async function isAiAvailable(): Promise<boolean> {
  // Always return true for Hugging Face - the online API is available if internet works
  return true;
}
