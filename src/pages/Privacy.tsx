import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pt-6 pb-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-[#F97316]" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
          </div>

          <div className="prose prose-blue max-w-none text-gray-600">
            <p className="lead text-lg text-gray-800 font-medium">Tu privacidad es nuestra prioridad.</p>
            
            <h3>1. Información que recopilamos</h3>
            <p>Recopilamos información que nos proporcionas directamente, como tu nombre, correo electrónico, número de teléfono y datos de ubicación cuando publicas un servicio. También recopilamos datos técnicos sobre tu dispositivo y uso de la app para mejorar el rendimiento.</p>

            <h3>2. Uso de la información</h3>
            <p>Utilizamos tu información para:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Proporcionar, mantener y mejorar nuestros servicios.</li>
                <li>Procesar transacciones y enviar notificaciones relacionadas.</li>
                <li>Verificar tu identidad y prevenir fraudes.</li>
                <li>Responder a tus comentarios y preguntas.</li>
              </ul>
            </p>

            <h3>3. Compartir información</h3>
            <p>No vendemos tus datos personales. Solo compartimos tu información pública (perfil de servicio) con otros usuarios para facilitar la conexión laboral. Podemos compartir datos con autoridades si es requerido por ley.</p>

            <h3>4. Seguridad de datos</h3>
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra el acceso no autorizado, la pérdida o alteración.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;