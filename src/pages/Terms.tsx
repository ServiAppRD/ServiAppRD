import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pt-6 pb-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-[#F97316]" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-50 rounded-xl text-[#F97316]">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Términos y Condiciones</h1>
          </div>

          <div className="prose prose-orange max-w-none text-gray-600">
            <p className="lead text-lg text-gray-800 font-medium">Última actualización: Octubre 2023</p>
            
            <h3>1. Aceptación de los Términos</h3>
            <p>Al acceder y utilizar ServiAPP, aceptas cumplir con estos términos de servicio y todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, tienes prohibido usar o acceder a este sitio.</p>

            <h3>2. Descripción del Servicio</h3>
            <p>ServiAPP es una plataforma que conecta a proveedores de servicios con usuarios que buscan dichos servicios. No somos empleadores de los proveedores ni garantizamos la calidad final del trabajo, aunque implementamos sistemas de verificación y reputación para maximizar la seguridad.</p>

            <h3>3. Cuentas de Usuario</h3>
            <p>Para utilizar ciertas funciones, debes registrarte. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Nos reservamos el derecho de eliminar cuentas que violen nuestras normas comunitarias.</p>

            <h3>4. Pagos y Reembolsos</h3>
            <p>Los pagos por servicios destacados (Boosts) no son reembolsables una vez activados, salvo en casos de error técnico comprobable de la plataforma.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;