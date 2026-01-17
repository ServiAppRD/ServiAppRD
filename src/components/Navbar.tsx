import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Navbar = () => {
  const tags = ["Plomería", "Electricidad", "Limpieza", "Mecánica", "Carpintería", "Jardinería", "Tecnología", "Belleza"];

  return (
    <div className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Top Header */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          {/* Logo */}
          <a href="/" className="flex-shrink-0 mr-2">
            <h1 className="text-2xl font-bold text-[#F97316] tracking-tight">ServiAPP</h1>
          </a>
        </div>

        {/* Search Bar Row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="¿Qué servicio necesitas hoy?" 
              className="w-full bg-white pl-10 pr-4 py-2 h-11 rounded-full border-gray-300 focus-visible:ring-[#F97316] text-base"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-[#F97316] hover:bg-orange-50">
            <SlidersHorizontal className="h-6 w-6" />
          </Button>
        </div>

        {/* Categories / Tags Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-3 no-scrollbar -mx-4 px-4">
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