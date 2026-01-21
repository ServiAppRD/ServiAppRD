import { X, Smartphone, Play } from "lucide-react";
import { useState, useEffect } from "react";

export const InstallAppBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verificar si ya fue descartado
    const isDismissed = localStorage.getItem('hideInstallBanner');
    if (!isDismissed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="hidden md:block bg-[#0F172A] border-b border-gray-800 relative z-40 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
                <div className="bg-white/10 p-2 rounded-xl">
                    <Smartphone className="h-5 w-5 text-[#F97316]" />
                </div>
                <div>
                    <p className="font-bold text-sm leading-tight">Descarga ServiAPP en tu celular</p>
                    <p className="text-xs text-gray-400 leading-tight mt-0.5">La mejor experiencia para contratar servicios.</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <a 
                    href="https://play.google.com/store/apps" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-900/20 hover:scale-105"
                >
                    <Play className="h-3 w-3 fill-current" />
                    Instalar en Play Store
                </a>
                <button 
                    onClick={() => {
                        setShow(false);
                        localStorage.setItem('hideInstallBanner', 'true');
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    </div>
  );
};