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
      // Detectar si se ha hecho scroll más de 20px
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn(
      "bg-white sticky top-0 z-50 shadow-sm transition-all duration-300",
      isScrolled ? "py-2" : "py-0"
    )}>
      <div className="container mx-auto px-4">
        
        {/* Logo Section - Collapses on scroll */}
        <div className={cn(
          "flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out",
          isScrolled ? "h-0 opacity-0 mb-0" : "h-auto opacity-100 pt-4 mb-3"
        )}>
          <a href="/" className="flex-shrink-0 mr-2">
            <img src="/logo.png" alt="ServiAPP" className="h-24 object-contain" />
          </a>
        </div>

        {/* Search Bar Row - Always visible but adjusts padding */}
        <div className={cn(
          "flex gap-2 items-center transition-all duration-300",
          isScrolled ? "pt-0" : "pt-0" 
        )}>
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

        {/* Categories / Tags Scroll - Collapses on scroll */}
        <div className={cn(
          "flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 transition-all duration-300 ease-in-out",
          isScrolled ? "h-0 opacity-0 py-0" : "h-auto opacity-100 pb-2 pt-3"
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