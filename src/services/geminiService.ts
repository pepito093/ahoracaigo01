import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuestion(category: string, difficulty: number): Promise<Question> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera una pregunta de trivia ALTAMENTE ALEATORIA y ÚNICA para un concurso estilo 'Ahora Caigo'. 
      Categoría: ${category}. Dificultad (1-10): ${difficulty}.
      Semilla de aleatoriedad: ${Math.random()}.
      
      REGLAS:
      1. La respuesta debe ser UNA SOLA PALABRA o una frase muy corta (max 2 palabras).
      2. No repitas preguntas comunes. Busca datos curiosos o interesantes.
      3. Proporciona un 'displayHint' que sea la respuesta con aproximadamente el 50-70% de las letras ocultas por guiones bajos, manteniendo espacios.
      Ejemplo: Respuesta "ALBERT EINSTEIN", Hint "A_B__T _I_S_E__".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            answer: { type: Type.STRING },
            displayHint: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["text", "answer", "displayHint", "category"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as Question;
  } catch (error) {
    console.error("Error generating question:", error);
    // Fallback question
    return {
      text: "¿Cuál es la capital de España?",
      answer: "MADRID",
      displayHint: "M_D_I_",
      category: "Geografía"
    };
  }
}
