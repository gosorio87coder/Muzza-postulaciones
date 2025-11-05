import type { InterviewQuestions } from "../types";

const FALLBACK_QUESTIONS: InterviewQuestions = {
  customerService: [
    // 1️⃣ MANTENEMOS ESTA
    "Cuéntanos una situación en la que hayas tenido que manejar a un cliente difícil. ¿Qué hiciste y cuál fue el resultado?",
    // 2️⃣ (ANTES ERA LA PREGUNTA 3) – ahora es la segunda y última
    "¿Cómo te aseguras de entender bien lo que el cliente realmente necesita?",
  ],
  salesAptitude: [
    // 1️⃣ MANTENEMOS ESTA
    "Imagina que una clienta tiene dudas sobre hacerse un procedimiento de cejas. ¿Cómo la ayudarías a decidir?",
    // 2️⃣ MANTENEMOS ESTA (antes era la 2, ahora es la 2 y última)
    "Cuando un cliente dice 'lo voy a pensar', ¿qué sueles responder? y ¿qué medidas sueles tomar?",
    // 👇 ELIMINADA la pregunta 3 ("¿Qué te motiva a vender más allá de la comisión?")
  ],
};

export async function generateInterviewQuestions(): Promise<InterviewQuestions> {
  // Si no quieres usar Gemini aún, devolvemos siempre el fallback:
  return FALLBACK_QUESTIONS;

  /*
  // Si más adelante quieres reactivar Gemini, podrías hacer algo así:

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY no configurada. Usando preguntas por defecto.");
    return FALLBACK_QUESTIONS;
  }

  try {
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
                    "Genera exactamente 2 preguntas para customerService y 2 preguntas para salesAptitude, en JSON...",
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Error HTTP Gemini:", response.status, await response.text());
      return FALLBACK_QUESTIONS;
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      JSON.stringify(FALLBACK_QUESTIONS);

    const parsed = JSON.parse(text) as InterviewQuestions;
    return parsed;
  } catch (err) {
    console.error("Error al llamar a Gemini:", err);
    return FALLBACK_QUESTIONS;
  }
  */
}


