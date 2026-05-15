// Ollama AI Helper
// Ollama runs locally at http://localhost:11434
// Make sure Ollama is running before using these functions

const OLLAMA_API = "http://localhost:11434/api/generate";

export async function generateGameDescription(gameTitle: string): Promise<string> {
  try {
    const response = await fetch(OLLAMA_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt: `Write a compelling 2-3 sentence game description for a video game called "${gameTitle}". Make it engaging and suitable for a game store. Only return the description, nothing else.`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response?.trim() || "";
  } catch (error) {
    console.error("Failed to generate description:", error);
    throw new Error("Failed to connect to Ollama. Make sure it's running on http://localhost:11434");
  }
}

export async function generateDeveloperName(gameTitle: string): Promise<string> {
  try {
    const response = await fetch(OLLAMA_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt: `Generate a fictional game studio/publisher name for a game called "${gameTitle}". The name should be creative and professional. Only return the studio name, nothing else. Max 3 words.`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response?.trim() || "";
  } catch (error) {
    console.error("Failed to generate developer name:", error);
    throw new Error("Failed to connect to Ollama. Make sure it's running on http://localhost:11434");
  }
}

export async function generateSystemRequirements(gameTitle: string): Promise<{
  minimum: { os: string; processor: string; memory: string; graphics: string; storage: string };
  recommended: { os: string; processor: string; memory: string; graphics: string; storage: string };
}> {
  try {
    const response = await fetch(OLLAMA_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt: `Generate realistic system requirements for a game called "${gameTitle}". Return ONLY valid JSON in this exact format:
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

Return ONLY the JSON, no other text.`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    const jsonStr = data.response?.trim() || "{}";
    
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Invalid JSON response");
  } catch (error) {
    console.error("Failed to generate system requirements:", error);
    throw new Error("Failed to connect to Ollama. Make sure it's running on http://localhost:11434");
  }
}

export async function isOllamaRunning(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}
