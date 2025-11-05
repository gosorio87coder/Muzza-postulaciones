import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateInterviewQuestions } from './services/geminiService';
import type { FormData, InterviewQuestions } from './types';
import Header from './components/Header';
import TextInput from './components/TextInput';
import TextArea from './components/TextArea';
import FileInput from './components/FileInput';
import Spinner from './components/Spinner';
import CollapsibleFieldset from './components/CollapsibleFieldset';

const initialFormData: FormData = {
  fullName: '',
  age: '',
  dni: '',
  phone: '',
  address: '',
  socialMedia: '',
  currentActivity: '',
  answers: {
    customerService: [],
    salesAptitude: [],
    motivation: '',
  },
};

type OpenSections = {
  customerService: boolean;
  salesAptitude: boolean;
  motivation: boolean;
  cv: boolean;
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [openSections, setOpenSections] = useState<OpenSections>({
    customerService: false,
    salesAptitude: false,
    motivation: false,
    cv: false,
  });

  const handleToggleSection = (section: keyof OpenSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const generatedQuestions = await generateInterviewQuestions();
      setQuestions(generatedQuestions);
      setFormData(prev => ({
          ...prev,
          answers: {
              ...prev.answers,
              customerService: Array(generatedQuestions.customerService.length).fill(''),
              salesAptitude: Array(generatedQuestions.salesAptitude.length).fill(''),
          }
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAnswerChange = (category: keyof InterviewQuestions, index: number, value: string) => {
    setFormData(prev => {
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

  const handleMotivationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        motivation: value,
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  const isFormValid = useMemo(() => {
    if (!formData.fullName || !formData.age || !formData.dni || !formData.phone || !formData.address || !cvFile) {
        return false;
    }
    if (!questions) return false;

    const allAnswered = (answers: (string | undefined)[]) => answers.every(answer => answer && answer.trim() !== '');

    return allAnswered(formData.answers.customerService) &&
           allAnswered(formData.answers.salesAptitude) &&
           formData.answers.motivation.trim() !== '';

  }, [formData, cvFile, questions]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || !cvFile) {
        alert("Por favor, completa todos los campos requeridos y adjunta tu CV.");
        return;
    }
    setSubmitting(true);

    const dataToSubmit = new FormData();

    // Adjuntar el archivo del CV
    dataToSubmit.append('cv', cvFile);

    // Adjuntar los demás datos del formulario como un solo objeto JSON para una fácil lectura
    const structuredData = {
        ...formData,
        questions: {
            customerService: questions?.customerService.map((q, i) => ({ question: q, answer: formData.answers.customerService[i] })),
            salesAptitude: questions?.salesAptitude.map((q, i) => ({ question: q, answer: formData.answers.salesAptitude[i] })),
        }
    };
    dataToSubmit.append('submission_data', JSON.stringify(structuredData, null, 2));


    try {
        // IMPORTANTE: Reemplaza esta URL con la URL de tu endpoint de Formspree
        const response = await fetch('https://formspree.io/f/xnnoejrq', {
            method: 'POST',
            body: dataToSubmit,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            setSubmitted(true);
        } else {
            throw new Error('Hubo un problema al enviar tu postulación.');
        }
    } catch (error) {
        console.error('Error al enviar el formulario:', error);
        alert(error instanceof Error ? error.message : "No se pudo enviar el formulario. Inténtalo de nuevo.");
    } finally {
        setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-3xl font-bold text-pink-600 mb-4">¡Gracias por postular!</h2>
            <p className="text-gray-700">Hemos recibido tu información correctamente. Nos pondremos en contacto contigo a la brevedad si tu perfil coincide con lo que estamos buscando.</p>
            <button onClick={() => { setSubmitted(false); setFormData(initialFormData); setCvFile(null); fetchQuestions(); }} className="mt-6 bg-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-600 transition duration-300">
                Enviar otra postulación
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <main className="max-w-4xl mx-auto">
        <Header />
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-b-lg shadow-md space-y-8">
          
          <fieldset>
            <legend className="text-xl font-semibold text-gray-800 border-b-2 border-pink-200 pb-2 mb-6 w-full">Datos Personales</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput label="Nombres y Apellidos" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
              <TextInput label="Edad" name="age" type="number" value={formData.age} onChange={handleInputChange} required />
              <TextInput label="DNI" name="dni" value={formData.dni} onChange={handleInputChange} required />
              <TextInput label="Celular" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
              <TextInput label="Distrito de Vivienda" name="address" value={formData.address} onChange={handleInputChange} required />
              <TextInput label="Redes Sociales (Link a perfil)" name="socialMedia" value={formData.socialMedia} onChange={handleInputChange} placeholder="Ej: https://instagram.com/usuario" />
            </div>
            <div className="mt-6">
              <TextArea label="Actividad Actual (Trabajo, estudios, etc.)" name="currentActivity" value={formData.currentActivity} onChange={handleTextAreaChange} rows={2} />
            </div>
          </fieldset>

          {loading && <Spinner />}
          {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          
          {questions && !loading && (
            <>
              <CollapsibleFieldset
                title="Experiencia en Atención al Cliente"
                isOpen={openSections.customerService}
                onToggle={() => handleToggleSection('customerService')}
              >
                <div className="space-y-6">
                  {questions.customerService.map((q, i) => (
                    <TextArea key={`cs-${i}`} label={`${i+1}. ${q}`} name={`cs-${i}`} value={formData.answers.customerService[i] || ''} onChange={(e) => handleAnswerChange('customerService', i, e.target.value)} required />
                  ))}
                </div>
              </CollapsibleFieldset>

              <CollapsibleFieldset
                title="Actitud y Aptitud para Ventas"
                isOpen={openSections.salesAptitude}
                onToggle={() => handleToggleSection('salesAptitude')}
              >
                <div className="space-y-6">
                  {questions.salesAptitude.map((q, i) => (
                    <TextArea key={`sa-${i}`} label={`${i+1}. ${q}`} name={`sa-${i}`} value={formData.answers.salesAptitude[i] || ''} onChange={(e) => handleAnswerChange('salesAptitude', i, e.target.value)} required />
                  ))}
                </div>
              </CollapsibleFieldset>
            </>
          )}

          <CollapsibleFieldset
            title="Sobre el Puesto y Tú"
            isOpen={openSections.motivation}
            onToggle={() => handleToggleSection('motivation')}
          >
            <div className="text-gray-700 space-y-4 mb-8 text-sm">
                <h3 className="text-base font-semibold text-gray-800">Propósito</h3>
                <p>Ser la primera cara del estudio (presencial y digital) y la dueña de los canales de contacto. El éxito depende de convertir las consultas en reservas con nuestras especialistas, guiando a los prospectos con mucha empatía, amabilidad y claridad.</p>

                <h3 className="text-base font-semibold text-gray-800 pt-2">Responsabilidades clave</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Atención omnicanal (usando un sistema CRM) cumpliendo los tiempos de respuesta máximos establecidos.</li>
                    <li>Descubrimiento y calificación: entender el caso (dolor, expectativas, antecedentes) clasificarlo y priorizarlo.</li>
                    <li>Cierre de cita: proponer el procedimiento adecuado y resolver objeciones. Agendar y enviar pre/post instrucciones según el caso.</li>
                    <li>Seguimiento inteligente: recordatorios, lista de espera, reactivación de prospectos fríos.</li>
                    <li>Gestión en CRM: registrar las interacción, actualizar etapas, etiquetas, motivos de pérdida y tareas para poder tener reportes.</li>
                    <li>Mejora continua: aportar guiones, FAQs, ideas para experimientos, feedback.</li>
                    <li>Calidad de servicio: mantener tono cálido, ortografía impecable, coherencia visual y cuidar la reputación de la marca.</li>
                    <li>Colaboracion: coordinar con especialistas: agenda, bloqueos, tiempos y testimonios.</li>
                </ul>

                <h3 className="text-base font-semibold text-gray-800 pt-2">Herramientas</h3>
                <p>Te brindaremos las mejores herramientas de tecnología para hacer las funciones de manera enfocada: CRM, IA, Sheets, Sistema de reservas y ventas.</p>

                <h3 className="text-base font-semibold text-gray-800 pt-2">Perfil adecuado</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Empatía genuina y escucha activa (entiende el dolor de los clientes).</li>
                    <li>Redacción persuasiva y clara (español impecable).</li>
                    <li>Vendedora consultiva (orientada a soluciones, no a “copiar y pegar”).</li>
                    <li>Orden/constancia: vive en el CRM.</li>
                    <li>Tolerancia a la presión, actitud proactiva y aprendizaje rápido.</li>
                    <li>Deseable: experiencia en belleza/salud/servicios y manejo de objeciones.</li>
                </ul>

                <h3 className="text-base font-semibold text-gray-800 pt-2">Condiciones</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Sueldo fijo: S/ 1,500</li>
                    <li>Comisiones promedio: S/ 350 - 400 (sin tope, crecen con el estudio)</li>
                    <li>Modalidad/Horario: presencial, tiempo completo, 45 horas/sem, 06 días Lunes a Sábado. Trabajar en Jesus María.</li>
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

          <CollapsibleFieldset
             title="Curriculum Vitae"
             isOpen={openSections.cv}
             onToggle={() => handleToggleSection('cv')}
           >
             <FileInput label="Adjuntar CV" name="cv" onChange={handleFileChange} fileName={cvFile ? cvFile.name : null} required />
          </CollapsibleFieldset>


          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || loading || submitting}
                className="w-full md:w-auto bg-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                {submitting ? 'Enviando...' : (loading ? 'Cargando...' : 'Enviar Postulación')}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default App;