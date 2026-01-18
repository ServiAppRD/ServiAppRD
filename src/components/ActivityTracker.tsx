import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

// Intervalo de sincronización con BD (60 segundos)
const SYNC_INTERVAL = 60 * 1000;

export const ActivityTracker = () => {
  const location = useLocation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const isActiveRef = useRef<boolean>(true);

  useEffect(() => {
    // Detectar visibilidad de la pestaña
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible';
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Iniciar intervalo de sincronización
    intervalRef.current = setInterval(async () => {
      // Solo contar si la pestaña está visible y hay una sesión
      if (!isActiveRef.current) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        // Llamar a la función RPC para sumar 60 segundos
        await supabase.rpc('increment_active_time', { seconds_to_add: 60 });
        console.log("Activity tracked: +60s");
      } catch (error) {
        console.error("Error tracking activity:", error);
      }
    }, SYNC_INTERVAL);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Resetear timer visual si cambiamos de ruta (opcional, para lógica interna)
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [location]);

  return null; // Componente invisible
};