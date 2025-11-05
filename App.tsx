import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { generateInterviewQuestions } from "./services/geminiService";
import type { FormData, InterviewQuestions } from "./types";

import Header from "./components/Header";
import TextInput from "./components/TextInput";
import TextArea from "./components/TextArea";
import Spinner from "./components/Spinner";
import CollapsibleFieldset from "./components/CollapsibleFieldset";

const initialFormData: FormData = {
  fullName: "",
  age: "",
  dni: "",
  phone: "",
  address: "",
  socialMedia: "",
  currentActivity: "",
  answers: {
    customerService: [],
    salesAptitude: [],
    motivation: "",
  },
};

type OpenSections = {
  customerService: boolean;
  salesAptitude: boolean;
  motivation: boolean;
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<OpenSections>({
    customerService: false,
    salesAptitude: false,
    motivation: false,
  });

  const handleToggleSection = (section: keyof OpenSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const generatedQuestions = await generateInterviewQuestions();
      setQuestions(generatedQuestions);

      setFormData((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          customerService: Array(
            generatedQuestions.customerService.length
          ).fill(""),
          salesAptitude: Array(
            generatedQuestions.salesAptitude.length
          ).fill(""),
        },
      }));
    } catch (err) {
      console.error("Error en fetchQuestions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error desconocido al generar las preguntas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (
    category: keyof InterviewQuestions,
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const newAnswers = [...(prev.answers[category] as string[])];
      newAnswers[index] = value;

      return {
        ...prev,
        answers: {
          ...prev.answers,
          [category]: newAnswers,
        },
      };
    });
  };

  const handleMotivationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        motivation: value,
      },
    }));
  };

  const isFormValid = useMemo(() => {
    if (
      !formData.fullName ||
      !formData.age ||
      !formData.dni ||
      !formData.phone ||
      !formData.address
    ) {
      return false;
    }
    if (!questions) return false;

    const allAnswered = (answers: (string | undefined)[]) =>
      answers.every((answer) => answer && answer.trim() !== "");

    return (
      allAnswered(formData.answers.customerService) &&
      allAnswered(formData.answers.salesAptitude) &&
      formData.answers.motivation.trim() !== ""
    );
  }, [formData, questions]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!isFormValid) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (!questions) {
      alert(
        "Todavía no se cargan las preguntas. Intenta de nuevo en unos segundos."
      );
      return;
    }

    setSubmitting(true);

    const structuredData = {
      ...formData,
      questions: {
        customerService: questions.customerService.map((q, i) => ({
          question: q,
          answer: formData.answers.customerService[i],
        })),
        salesAptitude: questions.salesAptitude.map((q, i) => ({
          question: q,
          answer: formData.answers.salesAptitude[i],
        })),
      },
    };

    try {
      const response = await fetch("https://formspree.io/f/xnnoejrq", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(structuredData, null, 2),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error(
          "Error Formspree:",
          errorData || response.statusText
        );
        throw new Error("Hubo un problema al enviar tu postulación.");
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el formulario. Inténtalo de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Subject sugerido para el correo con el CV
  const emailSubject = useMemo(
    () =>
      `${
        formData.dni && formData.dni.trim() !== ""
          ? formData.dni
          : "#DNI"
      } - Muzza atención`,
    [formData.dni]
  );

  const shareUrl = "https://muzza-postulaciones.vercel.app/";

  const handleCopyLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          alert(
            "Link copiado. Puedes pegarlo en WhatsApp o donde prefieras."
          );
        })
        .catch(() => {
          alert(
            "No se pudo copiar el link. Copia la URL manualmente, por favor."
          );
        });
    } else {
      alert(
        "Tu navegador no permite copiar automáticamente. Copia el link manualmente, por favor."
      );
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-pink-50/40">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-3xl font-bold text-pink-600 mb-4">
            ¡Gracias por postular!
          </h2>

          <p className="text-gray-700 mb-4">
            Hemos recibido tu información correctamente.
          </p>

          <p className="text-gray-700 mb-2">
            <strong>Para completar tu postulación</strong>, envía tu CV
            en PDF al correo:
          </p>

          <p className="text-pink-600 font-semibold mb-2">
            <a
              href={`mailto:postulaciones@asnivel.com?subject=${encodeURIComponent(
                emailSubject
              )}`}
              className="underline"
            >
              postulaciones@asnivel.com
            </a>
          </p>

          <p className="text-gray-700 mb-4">
            usando como asunto:&nbsp;
            <span className="font-mono bg-pink-50 px-2 py-1 rounded border border-pink-100">
              {emailSubject}
            </span>
          </p>

          <p className="text-xs text-gray-500 mb-8">
            Ejemplo: si tu DNI es 12345678, el asunto será{" "}
            <span className="font-mono">12345678 - Muzza atención</span>.
          </p>

          <div className="border-t border-pink-100 pt-6 mt-4">
            <p className="text-gray-700 mb-3">
              Si quieres enviarle esta oportunidad a una amiga, compártele
              este link:
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <code className="text-xs sm:text-sm bg-pink-50 px-3 py-2 rounded border border-pink-100 break-all">
                {shareUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-pink-500 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow hover:bg-pink-600 transition-colors"
              >
                Copiar link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-pink-50/40">
      <main className="max-w-4xl mx-auto">
        <Header />

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-b-lg shadow-md space-y-8"
        >
          {/* Datos personales */}
          <fieldset>
            <legend className="text-xl font-semibold text-gray-800 border-b-2 border-pink-200 pb-2 mb-6 w-full">
              Datos Personales
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="Nombres y Apellidos"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
              <TextInput
                label="Edad"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                required
              />
              <TextInput
                label="DNI"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                required
              />
              <TextInput
                label="Celular"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              <TextInput
                label="Distrito de Vivienda"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
              <TextInput
                label="Redes Sociales (Link a perfil)"
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleInputChange}
                placeholder="Ej: https://instagram.com/usuario"
              />
            </div>

            <div className="mt-6">
              <TextArea
                label="Actividad Actual (Trabajo, estudios, etc.)"
                name="currentActivity"
                value={formData.currentActivity}
                onChange={handleTextAreaChange}
                rows={2}
              />
            </div>
          </fieldset>

          {loading && <Spinner />}

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {questions && !loading && (
            <>
              <CollapsibleFieldset
                title="Experiencia en Atención al Cliente"
                isOpen={openSections.customerService}
                onToggle={() => handleToggleSection("customerService")}
              >
                <div className="space-y-6">
                  {questions.customerService.map((q, i) => (
                    <TextArea
                      key={`cs-${i}`}
                      label={`${i + 1}. ${q}`}
                      name={`cs-${i}`}
                      value={formData.answers.customerService[i] || ""}
                      onChange={(e) =>
                        handleAnswerChange(
                          "customerService",
                          i,
                          e.target.value
                        )
                      }
                      required
                    />
                  ))}
                </div>
              </CollapsibleFieldset>

              <CollapsibleFieldset
                title="Actitud y Aptitud para Ventas"
                isOpen={openSections.salesAptitude}
                onToggle={() => handleToggleSection("salesAptitude")}
              >
                <div className="space-y-6">
                  {questions.salesAptitude.map((q, i) => (
                    <TextArea
                      key={`sa-${i}`}
                      label={`${i + 1}. ${q}`}
                      name={`sa-${i}`}
                      value={formData.answers.salesAptitude[i] || ""}
                      onChange={(e) =>
                        handleAnswerChange(
                          "salesAptitude",
                          i,
                          e.target.value
                        )
                      }
                      required
                    />
                  ))}
                </div>
              </CollapsibleFieldset>
            </>
          )}

          <CollapsibleFieldset
            title="Sobre el Puesto y Tú"
            isOpen={openSections.motivation}
            onToggle={() => handleToggleSection("motivation")}
          >
            <div className="text-gray-700 space-y-4 mb-8 text-sm">
              <h3 className="text-base font-semibold text-gray-800">
                Propósito
              </h3>
              <p>
                Ser la primera cara del estudio (presencial y digital) y la
                dueña de los canales de contacto. El éxito depende de convertir
                las consultas en reservas con nuestras especialistas, guiando a
                los prospectos con mucha empatía, amabilidad y claridad.
              </p>

              <h3 className="text-base font-semibold text-gray-800 pt-2">
                Responsabilidades clave
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  Atención omnicanal (usando un sistema CRM) cumpliendo los
                  tiempos de respuesta máximos establecidos.
                </li>
                <li>
                  Descubrimiento y calificación: entender el caso (dolor,
                  expectativas, antecedentes) clasificarlo y priorizarlo.
                </li>
                <li>
                  Cierre de cita: proponer el procedimiento adecuado y resolver
                  objeciones. Agendar y enviar pre/post instrucciones según el
                  caso.
                </li>
                <li>
                  Seguimiento inteligente: recordatorios, lista de espera,
                  reactivación de prospectos fríos.
                </li>
                <li>
                  Gestión en CRM: registrar las interacciones, actualizar
                  etapas, etiquetas, motivos de pérdida y tareas para poder
                  tener reportes.
                </li>
                <li>
                  Mejora continua: aportar guiones, FAQs, ideas para
                  experimentos, feedback.
                </li>
                <li>
                  Calidad de servicio: mantener tono cálido, ortografía
                  impecable, coherencia visual y cuidar la reputación de la
                  marca.
                </li>
                <li>
                  Colaboración: coordinar con especialistas: agenda, bloqueos,
                  tiempos y testimonios.
                </li>
              </ul>

              <h3 className="text-base font-semibold text-gray-800 pt-2">
                Herramientas
              </h3>
              <p>
                Te brindaremos las mejores herramientas de tecnología para hacer
                las funciones de manera enfocada: CRM, IA, Sheets, sistema de
                reservas y ventas.
              </p>

              <h3 className="text-base font-semibold text-gray-800 pt-2">
                Perfil adecuado
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  Empatía genuina y escucha activa (entiende el dolor de los
                  clientes).
                </li>
                <li>
                  Redacción persuasiva y clara (español impecable).
                </li>
                <li>
                  Vendedora consultiva (orientada a soluciones, no a “copiar y
                  pegar”).
                </li>
                <li>Orden/constancia: vive en el CRM.</li>
                <li>
                  Tolerancia a la presión, actitud proactiva y aprendizaje
                  rápido.
                </li>
                <li>
                  Deseable: experiencia en belleza/salud/servicios y manejo de
                  objeciones.
                </li>
              </ul>

              <h3 className="text-base font-semibold text-gray-800 pt-2">
                Condiciones
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Sueldo fijo: S/ 1,500</li>
                <li>
                  Comisiones promedio: S/ 350 - 400 (sin tope, crecen con el
                  estudio)
                </li>
                <li>
                  Modalidad/Horario: presencial, tiempo completo, 45 horas/sem,
                  06 días Lunes a Sábado. Trabajar en Jesús María.
                </li>
              </ul>
            </div>

            <TextArea
              label="Ahora que conoces el puesto, ¿por qué eres la mejor para el puesto?"
              name="motivation"
              value={formData.answers.motivation}
              onChange={handleMotivationChange}
              required
              rows={6}
              placeholder="Describe aquí por qué tu perfil, experiencia y motivación te hacen la persona ideal para este rol en Muzza."
            />
          </CollapsibleFieldset>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || loading || submitting}
                className="w-full md:w-auto bg-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                {submitting
                  ? "Enviando..."
                  : loading
                  ? "Cargando..."
                  : "Enviar Postulación"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default App;

