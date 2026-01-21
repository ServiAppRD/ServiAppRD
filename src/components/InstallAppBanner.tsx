import { X, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";

export const InstallAppBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detectar si es PWA (Standalone) o si ya se descartó
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isDismissed = localStorage.getItem('hideInstallBanner');
    
    // Mostrar si NO es standalone y NO se ha descartado
    if (!isStandalone && !isDismissed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="bg-[#0F172A] text-white p-3 px-4 flex items-center justify-between relative z-40 animate-fade-in shadow-md">
        <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
                <Smartphone className="h-5 w-5 text-[#F97316]" />
            </div>
            <div>
                <p className="font-bold text-sm leading-tight">Instala ServiAPP</p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Más rápida y segura en Play Store</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <a 
                href="https://play.google.com/store/apps" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#F97316] hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors shadow-lg shadow-orange-900/20"
            >
                Instalar
            </a>
            <button 
                onClick={() => {
                    setShow(false);
                    localStorage.setItem('hideInstallBanner', 'true');
                }}
                className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    </div>
  );
};