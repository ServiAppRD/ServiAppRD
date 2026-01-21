import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Mail } from "lucide-react";
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
            <p className="lead text-lg text-gray-800 font-medium">Última actualización: 21/1/2026</p>
            <p>Al descargar, acceder o utilizar Servi APP, aceptas los siguientes términos y condiciones. Si no estás de acuerdo con ellos, debes dejar de usar la aplicación.</p>
            
            <h3>1. Sobre ServiAPP</h3>
            <p>ServiAPP es una plataforma digital que conecta usuarios que buscan servicios con proveedores que ofrecen servicios dentro de la República Dominicana.</p>
            <p>ServiAPP <strong>NO</strong> presta directamente los servicios publicados en la plataforma. Solo facilita el contacto entre las partes.</p>

            <h3>2. Registro y perfil</h3>
            <p>Para publicar servicios, el usuario deberá:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Crear un perfil válido</li>
                <li>Proporcionar información verídica</li>
                <li>Verificar su número de teléfono</li>
            </ul>
            <p className="mt-2">El usuario es responsable de la veracidad de la información que comparte.</p>

            <h3>3. Uso de la plataforma</h3>
            <p>El usuario se compromete a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>No publicar contenido falso o engañoso</li>
                <li>No cometer fraudes</li>
                <li>No usar la app para actividades ilegales</li>
                <li>No acosar, discriminar o insultar a otros usuarios</li>
                <li>No suplantar identidades</li>
            </ul>
            <p className="mt-2">ServiAPP puede suspender o eliminar cuentas que incumplan estas reglas.</p>

            <h3>4. Relación entre usuarios</h3>
            <p>ServiAPP actúa solo como intermediario tecnológico. Esto significa que:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ServiAPP no es responsable por la calidad, cumplimiento o resultado de los servicios contratados.</li>
                <li>Cualquier acuerdo, pago o trato es entre el cliente y el proveedor del servicio.</li>
            </ul>

            <h3>5. Pagos y suscripciones</h3>
            <p>ServiAPP ofrece suscripciones y promociones pagadas:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Los pagos no son reembolsables una vez activados.</li>
                <li>ServiAPP puede modificar precios con previo aviso.</li>
                <li>El usuario puede cancelar su suscripción en cualquier momento desde su cuenta.</li>
            </ul>

            <h3>6. Eliminación de cuenta</h3>
            <p>El usuario puede solicitar la eliminación de su cuenta desde la app o mediante la web de ServiAPP.</p>
            <p>Al eliminar la cuenta:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Se borrarán sus datos personales principales</li>
                <li>Pueden mantenerse registros anónimos para estadísticas internas</li>
            </ul>

            <h3>7. Cambios en los términos</h3>
            <p>ServiAPP puede actualizar estos términos en cualquier momento. El uso continuo de la app implica aceptación de los cambios.</p>

            <h3>8. Contacto</h3>
            <p>Para dudas legales o soporte:</p>
            <div className="flex items-center gap-2 mt-2 font-medium text-[#F97316]">
                <Mail className="h-4 w-4" />
                <a href="mailto:serviapp.help@gmail.com" className="hover:underline">serviapp.help@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;