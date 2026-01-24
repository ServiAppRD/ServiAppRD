import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Upload, CheckCircle2, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface VerificationFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const VerificationFlow = ({ onComplete, onCancel }: VerificationFlowProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ front: File | null; back: File | null; selfie: File | null }>({
    front: null,
    back: null,
    selfie: null
  });
  const [previews, setPreviews] = useState<{ front: string; back: string; selfie: string }>({
    front: "",
    back: "",
    selfie: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      if (step === 1) {
        setImages(prev => ({ ...prev, front: file }));
        setPreviews(prev => ({ ...prev, front: url }));
      } else if (step === 2) {
        setImages(prev => ({ ...prev, back: file }));
        setPreviews(prev => ({ ...prev, back: url }));
      } else if (step === 3) {
        setImages(prev => ({ ...prev, selfie: file }));
        setPreviews(prev => ({ ...prev, selfie: url }));
      }
    }
  };

  const uploadToStorage = async (file: File, path: string) => {
    const { error } = await supabase.storage.from('verification-docs').upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  };

  const handleSubmit = async () => {
    if (!images.front || !images.back || !images.selfie) return showError("Faltan imágenes");
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No sesión");

      const userId = session.user.id;
      const timestamp = Date.now();

      // 1. Subir imágenes
      const frontPath = `${userId}/front_${timestamp}.jpg`;
      const backPath = `${userId}/back_${timestamp}.jpg`;
      const selfiePath = `${userId}/selfie_${timestamp}.jpg`;

      await uploadToStorage(images.front, frontPath);
      await uploadToStorage(images.back, backPath);
      await uploadToStorage(images.selfie, selfiePath);

      // 2. Actualizar estado a "Pendiente" en BD inmediatamente
      await supabase.from('profiles').update({ 
        verification_status: 'pending',
        is_verified: false 
      }).eq('id', userId);

      // 3. Invocar Edge Function (Background Process)
      // No esperamos (await) el resultado final para no bloquear al usuario
      supabase.functions.invoke('verify-identity', {
        body: { frontPath, backPath, selfiePath, userId }
      }).then(({ data, error }) => {
         if (error) console.error("Error en verificación IA:", error);
         else console.log("Resultado verificación IA:", data);
      });

      showSuccess("Documentos enviados. La IA está analizando tu identidad en segundo plano.");
      onComplete();

    } catch (error: any) {
      console.error(error);
      showError("Error al subir documentos. Verifica que el bucket 'verification-docs' exista.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !images.front) return showError("Sube la foto frontal");
    if (step === 2 && !images.back) return showError("Sube la foto trasera");
    if (step === 3 && !images.selfie) return showError("Toma la selfie");
    
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const renderUploadBox = (label: string, preview: string, icon: any) => (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group",
        preview ? "border-[#F97316] bg-orange-50" : "border-gray-300 bg-gray-50 hover:border-[#F97316]"
      )}
    >
      {preview ? (
        <>
          <img src={preview} className="w-full h-full object-cover" alt="Preview" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white font-bold flex items-center gap-2"><Camera className="h-5 w-5"/> Cambiar</span>
          </div>
        </>
      ) : (
        <div className="text-center p-6 text-gray-400 group-hover:text-[#F97316] transition-colors">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
             {icon}
          </div>
          <p className="font-medium text-sm">{label}</p>
        </div>
      )}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        capture={step === 3 ? "user" : "environment"} 
        className="hidden" 
        onChange={handleFileSelect} 
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
         <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" size="icon" onClick={onCancel}><X className="h-6 w-6" /></Button>
            <div className="flex gap-2">
               {[1, 2, 3].map(i => (
                 <div key={i} className={cn("h-2 w-2 rounded-full transition-all", step === i ? "bg-[#F97316] w-6" : step > i ? "bg-[#F97316]" : "bg-gray-200")} />
               ))}
            </div>
            <div className="w-10" />
         </div>
         <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
            {step === 1 && "Foto de tu Cédula (Frente)"}
            {step === 2 && "Foto de tu Cédula (Dorso)"}
            {step === 3 && "Selfie de Verificación"}
         </h1>
         <p className="text-center text-gray-500 text-sm px-4">
            {step === 1 && "Asegúrate de que el texto sea legible y sin brillos."}
            {step === 2 && "Gira tu documento y toma una foto clara."}
            {step === 3 && "Asegúrate de tener buena iluminación y no usar gafas."}
         </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col justify-center max-w-md mx-auto w-full">
         {step === 1 && renderUploadBox("Tocar para tomar foto", previews.front, <ShieldCheck className="h-8 w-8" />)}
         {step === 2 && renderUploadBox("Tocar para tomar foto", previews.back, <ShieldCheck className="h-8 w-8" />)}
         {step === 3 && renderUploadBox("Tocar para tomar selfie", previews.selfie, <Camera className="h-8 w-8" />)}
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-white border-t border-gray-100 pb-safe">
         <div className="max-w-md mx-auto">
             <Button 
               onClick={nextStep} 
               disabled={loading} 
               className="w-full h-14 bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-orange-200"
             >
               {loading ? (
                 <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Subiendo...</span>
               ) : step === 3 ? "Finalizar Verificación" : "Siguiente Paso"}
             </Button>
         </div>
      </div>
    </div>
  );
};