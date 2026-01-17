import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<any>;
  children: React.ReactNode;
}

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [startY, setStartY] = useState(0);
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Maximum pull distance in pixels
  const MAX_PULL = 180;
  // Threshold to trigger refresh
  const REFRESH_THRESHOLD = 80;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Solo habilitar si estamos en el tope de la página
      if (window.scrollY <= 5) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startY) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      // Solo manejar el gesto si estamos bajando desde el tope
      if (window.scrollY <= 5 && diff > 0 && !isRefreshing) {
        // Resistencia logarítmica para sensación elástica
        const newPullY = Math.min(diff * 0.45, MAX_PULL);
        setPullY(newPullY);
      }
    };

    const handleTouchEnd = async () => {
      if (!startY) return;

      if (pullY > REFRESH_THRESHOLD) {
        setIsRefreshing(true);
        setPullY(60); // Mantener spinner visible
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullY(0);
        }
      } else {
        setPullY(0); // Regresar suavemente
      }
      setStartY(0);
    };

    // Usamos listeners en window para capturar gestos globales
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullY, isRefreshing, onRefresh]);

  return (
    <div className="relative min-h-screen">
      {/* Loading Spinner Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 flex justify-center z-[100] pointer-events-none transition-all duration-300"
        style={{ 
          transform: `translateY(${isRefreshing ? 70 : (pullY > 0 ? pullY - 20 : -50)}px)`,
          opacity: pullY > 10 || isRefreshing ? 1 : 0 
        }}
      >
        <div className="bg-white h-11 w-11 rounded-full shadow-lg border border-gray-100 flex items-center justify-center">
           <Loader2 
             className={`h-6 w-6 text-[#F97316] ${isRefreshing ? "animate-spin" : ""}`} 
             style={{ transform: !isRefreshing ? `rotate(${pullY * 3}deg)` : undefined }}
           />
        </div>
      </div>

      {/* Main Content with Transform */}
      <div 
        style={{ 
          transform: `translateY(${pullY}px)`,
          transition: isRefreshing || pullY === 0 ? "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
          willChange: "transform"
        }}
      >
        {children}
      </div>
    </div>
  );
};