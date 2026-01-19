import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, Mail, RefreshCw, CheckCircle2 } from "lucide-react";

interface EmailVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  email: string;
}

export const EmailVerificationDialog = ({ 
  open, 
  onOpenChange, 
  onVerified,
  email
}: EmailVerificationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      showSuccess("Correo de confirmación reenviado. Revisa tu bandeja.");
    } catch (error: any) {
      console.error(error);
      // Supabase a veces limita la frecuencia de reenvío
      showError(error.message || "Espera unos minutos antes de reenviar.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      // 1. Refrescar la sesión para obtener los datos más recientes del usuario
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;

      if (session?.user?.email_confirmed_at) {
        showSuccess("¡Email verificado correctamente!");
        onVerified(); // Callback para continuar con la publicación
        onOpenChange(false);
      } else {
        showError("Aún no detectamos la verificación. Asegúrate de hacer clic en el enlace del correo.");
      }
    } catch (error: any) {
      showError("Error al verificar estado.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
             <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-bold">Verifica tu Correo</DialogTitle>
          <DialogDescription className="text-center">
            Para mantener la calidad de la comunidad, necesitas confirmar tu email <strong>{email}</strong> antes de publicar servicios.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
            <p>1. Busca el correo de <strong>ServiAPP</strong> en tu bandeja.</p>
            <p>2. Haz clic en el enlace de confirmación.</p>
            <p>3. Regresa aquí y presiona "Ya confirmé mi correo".</p>
          </div>

          <div className="grid gap-3">
             <Button 
                onClick={handleCheckStatus} 
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-md shadow-blue-100"
                disabled={checking}
              >
                {checking ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                Ya confirmé mi correo
              </Button>

              <Button 
                onClick={handleResendEmail} 
                variant="outline"
                className="w-full border-gray-200 h-12 text-gray-600"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Reenviar correo"}
              </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};