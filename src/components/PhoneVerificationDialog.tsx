import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, Phone, ShieldCheck } from "lucide-react";

interface PhoneVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  userId: string;
  currentPhone?: string;
}

export const PhoneVerificationDialog = ({ 
  open, 
  onOpenChange, 
  onVerified,
  userId,
  currentPhone = ""
}: PhoneVerificationDialogProps) => {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [phone, setPhone] = useState(currentPhone);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper para formatear a E.164 (Asumiendo RD +1 si son 10 dígitos)
  const formatPhone = (input: string) => {
    const numbers = input.replace(/\D/g, '');
    if (numbers.length === 10) return `+1${numbers}`;
    return `+${numbers}`;
  };

  const handleSendCode = async () => {
    const cleanNumber = phone.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      showError("Ingresa un número válido (mínimo 10 dígitos)");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhone(phone);
      console.log("Enviando código a:", formattedPhone);

      // Enviar OTP real vía Supabase (SMS provider configurado)
      const { error } = await supabase.auth.updateUser({
        phone: formattedPhone
      });

      if (error) throw error;

      showSuccess("Código SMS enviado. Revisa tu celular.");
      setStep('verify');
      
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al enviar el SMS. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) {
      showError("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhone(phone);

      // Verificar el OTP real
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: code,
        type: 'phone_change'
      });

      if (error) throw error;

      // Actualizar el perfil público en la base de datos
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          phone: formattedPhone,
          phone_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      showSuccess("¡Teléfono verificado exitosamente!");
      onVerified();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Código inválido o expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('input');
    setCode("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center items-center">
          <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
             <ShieldCheck className="h-6 w-6 text-[#F97316]" />
          </div>
          <DialogTitle className="text-xl font-bold">Verificación de Seguridad</DialogTitle>
          <DialogDescription className="text-center">
            Para publicar servicios, necesitamos verificar que tu número es real mediante un SMS.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {step === 'input' ? (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Número de Celular</Label>
                <div className="relative">
                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="809-000-0000" 
                      className="pl-10 h-12 text-lg"
                      type="tel"
                   />
                </div>
                <p className="text-xs text-gray-500">Recibirás un código de 6 dígitos.</p>
              </div>
              <Button 
                onClick={handleSendCode} 
                className="w-full bg-[#F97316] hover:bg-orange-600 h-12 text-base font-bold"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Enviar SMS"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in flex flex-col items-center">
               <div className="text-center space-y-1">
                  <p className="text-sm text-gray-600">Ingresa el código enviado a</p>
                  <p className="font-bold text-gray-900">{formatPhone(phone)} <span onClick={handleBack} className="text-[#F97316] text-xs underline cursor-pointer ml-1">Cambiar</span></p>
               </div>

               <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-10 border-gray-300" />
                    <InputOTPSlot index={1} className="h-12 w-10 border-gray-300" />
                    <InputOTPSlot index={2} className="h-12 w-10 border-gray-300" />
                    <InputOTPSlot index={3} className="h-12 w-10 border-gray-300" />
                    <InputOTPSlot index={4} className="h-12 w-10 border-gray-300" />
                    <InputOTPSlot index={5} className="h-12 w-10 border-gray-300" />
                  </InputOTPGroup>
               </InputOTP>

               <Button 
                onClick={handleVerify} 
                className="w-full bg-[#F97316] hover:bg-orange-600 h-12 text-base font-bold"
                disabled={loading || code.length < 6}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Verificar Código"}
              </Button>
              
              <button onClick={handleSendCode} disabled={loading} className="text-xs text-gray-500 hover:text-gray-900 underline">
                 ¿No llegó? Reenviar código
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};