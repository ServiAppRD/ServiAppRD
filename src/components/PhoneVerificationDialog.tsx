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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Loader2, Phone, ShieldCheck, ArrowRight, MessageSquare } from "lucide-react";

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
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      showError("Ingresa un número válido (mínimo 10 dígitos)");
      return;
    }

    setLoading(true);
    // SIMULACIÓN DE ENVÍO SMS
    // En producción, aquí llamarías a tu Edge Function con Twilio/MessageBird
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(mockCode);
    setLoading(false);
    setStep('verify');
    
    // MOSTRAR EL CÓDIGO AL USUARIO (Para simulación)
    showSuccess(`Tu código de verificación es: ${mockCode}`);
    console.log("SMS Code Sent:", mockCode);
  };

  const handleVerify = async () => {
    if (code !== generatedCode) {
      showError("Código incorrecto. Intenta de nuevo.");
      setCode("");
      return;
    }

    setLoading(true);
    try {
      // 1. Actualizar el perfil con el teléfono y el estado verificado
      const { error } = await supabase
        .from('profiles')
        .update({ 
          phone: phone,
          phone_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      showSuccess("¡Teléfono verificado exitosamente!");
      onVerified();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error(error);
      showError("Error al guardar la verificación");
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
            Para mantener la comunidad segura, necesitamos verificar tu número antes de publicar.
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
                <p className="text-xs text-gray-500">Te enviaremos un código por SMS.</p>
              </div>
              <Button 
                onClick={handleSendCode} 
                className="w-full bg-[#F97316] hover:bg-orange-600 h-12 text-base font-bold"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Enviar Código"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in flex flex-col items-center">
               <div className="text-center space-y-1">
                  <p className="text-sm text-gray-600">Hemos enviado un código al</p>
                  <p className="font-bold text-gray-900">{phone} <span onClick={handleBack} className="text-[#F97316] text-xs underline cursor-pointer ml-1">Cambiar</span></p>
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
                {loading ? <Loader2 className="animate-spin" /> : "Verificar Teléfono"}
              </Button>
              
              <button onClick={handleSendCode} disabled={loading} className="text-xs text-gray-500 hover:text-gray-900 underline">
                 Reenviar código
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};