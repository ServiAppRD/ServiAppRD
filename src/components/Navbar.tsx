import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const tags = ["Plomería", "Electricidad", "Limpieza", "Mecánica", "Carpintería", "Jardinería", "Tecnología", "Belleza"];

  useEffect(() => {
    const handleScroll = () => {
      // Detectar scroll con un umbral bajo para respuesta rápida
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn(
      "bg-white sticky top-0 z-50 transition-all duration-500 ease-in-out",
      isScrolled ? "py-2 shadow-md" : "py-3 shadow-sm"
    )}>
      <div className="container mx-auto px-4">
        
        {/* Search Bar Row - Always visible */}
        <div className="flex gap-2 items-center transition-all duration-500">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="¿Qué servicio necesitas hoy?" 
              className="w-full bg-white pl-10 pr-4 py-2 h-11 rounded-full border-gray-300 focus-visible:ring-[#F97316] text-base shadow-sm"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-[#F97316] hover:bg-orange-50 shrink-0">
            <SlidersHorizontal className="h-6 w-6" />
          </Button>
        </div>

        {/* Categories / Tags Scroll - Collapses smoothly */}
        <div className={cn(
          "flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 transition-all duration-500 ease-in-out origin-top",
          isScrolled 
            ? "max-h-0 opacity-0 py-0 translate-y-[-10px] mt-0" 
            : "max-h-20 opacity-100 pb-1 pt-3 translate-y-0 mt-0"
        )}>
          {tags.map((tag, i) => (
            <button 
              key={i}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                i === 0 
                  ? "bg-[#F97316] border-[#F97316] text-white" 
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#F97316] hover:text-[#F97316]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};