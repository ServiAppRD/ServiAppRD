import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail } from "lucide-react";
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
            <p className="lead text-lg text-gray-800 font-medium">Última actualización: 21/1/2026</p>
            <p>Esta política explica cómo ServiAPP recopila, usa y protege tus datos.</p>
            
            <h3>1. Información que recopilamos</h3>
            <p>Podemos recopilar:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Nombre y apellido</li>
                <li>Número de teléfono</li>
                <li>Correo electrónico</li>
                <li>Fotos de perfil</li>
                <li>Datos de servicios publicados</li>
                <li>Reseñas y calificaciones</li>
                <li>Uso de la app</li>
            </ul>
            <p className="mt-2">No recopilamos información sensible sin tu consentimiento.</p>

            <h3>2. Cómo usamos tu información</h3>
            <p>Usamos tus datos para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Permitir la publicación de servicios</li>
                <li>Mostrar tu perfil a otros usuarios</li>
                <li>Verificar identidad</li>
                <li>Mejorar la experiencia de la app</li>
                <li>Evitar fraudes y abusos</li>
            </ul>

            <h3>3. Compartición de datos</h3>
            <p>No vendemos tus datos personales a terceros.</p>
            <p>Podemos compartir información cuando sea necesario para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Cumplir con la ley</li>
                <li>Prevenir fraudes</li>
                <li>Mantener la seguridad de la app</li>
            </ul>

            <h3>4. Almacenamiento de datos</h3>
            <p>Tus datos se almacenan en servidores seguros.</p>
            <p>ServiAPP toma medidas técnicas para proteger tu información.</p>

            <h3>5. Eliminación de datos</h3>
            <p>Puedes solicitar la eliminación total de tus datos desde:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>La app</li>
                <li>O escribiendo al correo de soporte</li>
            </ul>

            <h3>6. Uso por menores de edad</h3>
            <p>Si eres menor de 18 años, debes usar ServiAPP con autorización de tus padres o tutor legal.</p>

            <h3>7. Cambios en la política</h3>
            <p>ServiAPP puede actualizar esta política en cualquier momento.</p>
            <p>Te notificaremos dentro de la app si hay cambios importantes.</p>

            <h3>8. Contacto</h3>
            <p>Si tienes preguntas sobre tu privacidad:</p>
            <div className="flex items-center gap-2 mt-2 font-medium text-blue-600">
                <Mail className="h-4 w-4" />
                <a href="mailto:soporte@serviapprd.com" className="hover:underline">soporte@serviapprd.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;