import type { InterviewQuestions } from "../types";

const FALLBACK_QUESTIONS: InterviewQuestions = {
  customerService: [
    "Cuéntanos una situación en la que hayas tenido que manejar a un cliente difícil. ¿Qué hiciste y cuál fue el resultado?",
    "¿Qué significa para ti brindar una atención al cliente excelente?",
    "¿Cómo te aseguras de entender bien lo que el cliente realmente necesita?",
  ],
  salesAptitude: [
    "Imagina que una clienta tiene dudas sobre hacerse un procedimiento de cejas. ¿Cómo la ayudarías a decidir?",
    "Cuando un cliente dice 'lo voy a pensar', ¿qué sueles responder?",
    "¿Qué te motiva a vender más allá de la comisión?",
  ],
};

// Si quieres mantener Gemini, lo dejamos pero con fallback
export async function generateInterviewQuestions(): Promise<InterviewQuestions> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Si no hay API key, usamos directamente el fallback
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY no configurada. Usando preguntas por defecto.");
    return FALLBACK_QUESTIONS;
  }

  try {
    // AQUÍ iría tu llamada real a Gemini. Ejemplo genérico:
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Genera 3 preguntas para evaluar experiencia en atención al cliente y 3 preguntas para evaluar actitud/aptitud comercial. Devuélvelas en JSON con las claves customerService y salesAptitude (arrays de strings).",
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Error HTTP Gemini:", response.status, await response.text());
      // usamos fallback
      return FALLBACK_QUESTIONS;
    }

    const data = await response.json();

    // Ojo: aquí depende del formato real que devuelva Gemini.
    // Te dejo un parseo simple que puedes ajustar:
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      JSON.stringify(FALLBACK_QUESTIONS);

    const parsed = JSON.parse(text) as InterviewQuestions;

    return parsed;
  } catch (error) {
    console.error("Error al llamar a Gemini:", error);
    // Si algo falla, nunca lanzamos error: devolvemos fallback
    return FALLBACK_QUESTIONS;
  }
}

