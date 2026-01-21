import { X, Smartphone } from "lucide-react";
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
    <div className="hidden md:block w-full bg-white animate-fade-in">
        {/* Contenedor limitado al ancho de la web (max-w-7xl) */}
        <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-[#0F172A] rounded-2xl p-4 md:px-8 flex items-center justify-between text-white shadow-xl relative overflow-hidden">
                
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316] rounded-full blur-[80px] opacity-10 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex items-center gap-5 relative z-10">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                        <Smartphone className="h-6 w-6 text-[#F97316]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Descarga ServiAPP</h3>
                        <p className="text-sm text-gray-400 mt-1">La mejor experiencia para contratar servicios, ahora en tu celular.</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <a 
                        href="https://play.google.com/store/apps" 
                        target="_blank" 
                        rel="noreferrer"
                        className="transition-transform hover:scale-105"
                    >
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                            alt="Disponible en Google Play" 
                            className="h-12 w-auto"
                        />
                    </a>
                    <button 
                        onClick={() => {
                            setShow(false);
                            localStorage.setItem('hideInstallBanner', 'true');
                        }}
                        className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                        aria-label="Cerrar anuncio"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};