import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Iniciar la animación de salida
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
      setScale(1.1); // Efecto sutil de zoom al salir
    }, 2500);

    // Desmontar el componente
    const unmountTimer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-all duration-700 ease-in-out",
        opacity === 0 ? "pointer-events-none opacity-0" : "opacity-100"
      )}
      style={{ transform: `scale(${scale})` }}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo Container with Pulse Effect */}
        <div className="relative w-40 h-40 mb-8 animate-pulse">
           <img 
             src="/logo.png" 
             alt="ServiAPP" 
             className="w-full h-full object-contain drop-shadow-sm" 
           />
        </div>
        
        {/* Custom Loading Bar */}
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-[#F97316] rounded-full"
            style={{
              animation: "loadingProgress 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards"
            }}
          />
        </div>

        <p className="mt-4 text-xs font-semibold text-gray-400 tracking-[0.2em] uppercase animate-pulse">
          Cargando
        </p>
      </div>
      
      {/* Inline styles for custom keyframe since we can't edit tailwind config easily */}
      <style>{`
        @keyframes loadingProgress {
          0% { width: 0%; }
          40% { width: 60%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};