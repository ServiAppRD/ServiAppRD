import { useEffect } from "react";
import { Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface PlusSuccessOverlayProps {
  onClose: () => void;
}

export const PlusSuccessOverlay = ({ onClose }: PlusSuccessOverlayProps) => {
  useEffect(() => {
    // Confeti Explosión
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 6000 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Confeti desde los lados superiores
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center pt-16 px-4 pointer-events-auto bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-top-[100%] duration-700 ease-out relative border-4 border-[#0239c7]">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-b from-[#0239c7] to-[#002080] p-8 text-center relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-10 -left-10 w-24 h-24 bg-[#F97316]/20 rounded-full blur-xl"></div>

            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-900/50 relative z-10 animate-in zoom-in duration-500 delay-150">
                <Crown className="h-10 w-10 text-[#F97316] fill-[#F97316]" />
            </div>
            
            <h2 className="text-3xl font-black text-white relative z-10 tracking-tight">¡Bienvenido!</h2>
            <p className="text-blue-200 text-sm font-medium relative z-10 mt-1 uppercase tracking-widest">Ya eres miembro Plus</p>
        </div>

        {/* Body */}
        <div className="p-6 bg-white space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="bg-green-500 p-1.5 rounded-full shadow-sm shadow-green-200"><Check className="h-4 w-4 text-white" strokeWidth={4} /></div>
                    <span className="text-sm font-bold text-gray-700">Verificación Activada</span>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="bg-green-500 p-1.5 rounded-full shadow-sm shadow-green-200"><Check className="h-4 w-4 text-white" strokeWidth={4} /></div>
                    <span className="text-sm font-bold text-gray-700">Posicionamiento Top</span>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="bg-green-500 p-1.5 rounded-full shadow-sm shadow-green-200"><Check className="h-4 w-4 text-white" strokeWidth={4} /></div>
                    <span className="text-sm font-bold text-gray-700">Publicaciones Ilimitadas</span>
                </div>
            </div>
            
            <Button onClick={onClose} className="w-full bg-[#0239c7] hover:bg-[#022b9e] text-white font-black text-lg h-14 rounded-2xl shadow-xl shadow-blue-200 transition-transform active:scale-95">
                ¡Empezar ahora!
            </Button>
        </div>
      </div>
    </div>
  );
};