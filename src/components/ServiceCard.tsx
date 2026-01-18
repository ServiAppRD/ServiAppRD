import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

interface ServiceCardProps {
  id?: string;
  title: string;
  price: string;
  image: string;
  badge?: { text: string; color: "yellow" | "blue" | "orange" | "gray" };
}

export const ServiceCard = ({ id, title, price, image, badge }: ServiceCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const checkFavorite = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from('favorites').select('id').eq('user_id', session.user.id).eq('service_id', id).maybeSingle();
      if (data) setIsFavorite(true);
    };
    checkFavorite();
  }, [id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showError("Debes iniciar sesión para guardar favoritos");
      setLoading(false);
      return;
    }
    try {
      if (isFavorite) {
        const { error } = await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('service_id', id);
        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase.from('favorites').insert({ user_id: session.user.id, service_id: id });
        if (error) throw error;
        setIsFavorite(true);
        showSuccess("Guardado en favoritos");
      }
    } catch (error) {
      console.error(error);
      showError("Error al actualizar favoritos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-[160px] md:w-full h-full flex-shrink-0 group cursor-pointer relative transition-all duration-300 md:hover:-translate-y-1">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100 border border-gray-100">
        <img 
          src={image} 
          alt={title} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        
        {badge && (
          <Badge 
            className={`absolute top-2 left-2 border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${
              badge.color === "yellow" 
                ? "bg-[#fbce07] text-black hover:bg-[#fbce07]" 
                : badge.color === "blue"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : badge.color === "orange"
                ? "bg-[#F97316] text-white hover:bg-orange-600"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {badge.text}
          </Badge>
        )}

        <button 
          onClick={toggleFavorite}
          disabled={loading}
          className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-sm z-10 disabled:opacity-50 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-all", 
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
            )} 
          />
        </button>
      </div>

      <div className="px-1 flex flex-col flex-1">
        <p className="font-bold text-base text-[#F97316] mb-0.5">{price}</p>
        <h3 className="font-medium text-gray-600 md:text-gray-900 line-clamp-2 text-xs md:text-sm leading-snug group-hover:text-[#F97316] transition-colors flex-1">
          {title}
        </h3>
      </div>
    </div>
  );
};