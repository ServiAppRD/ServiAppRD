import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [startExit, setStartExit] = useState(false);

  useEffect(() => {
    // Esperar un momento antes de iniciar la expansión
    const timer = setTimeout(() => {
      setStartExit(true);
    }, 2000);

    // Finalizar y desmontar después de la animación
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2600); // 2000ms espera + 600ms transición

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-[#F97316] overflow-hidden transition-opacity duration-700 ease-in-out",
        startExit ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div 
        className={cn(
          "w-48 h-48 transition-transform duration-700 ease-[cubic-bezier(0.87, 0, 0.13, 1)]",
          startExit ? "scale-[50] opacity-0" : "scale-100"
        )}
      >
        <img 
          src="/logo-white.png" 
          alt="ServiAPP" 
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
    </div>
  );
};