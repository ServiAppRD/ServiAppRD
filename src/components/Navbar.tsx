import { Search, PlusCircle, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Navbar = () => {
  return (
    <nav className="bg-white text-[#0F172A] py-4 sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* Logo area */}
        <div className="flex items-center gap-2">
          <Menu className="h-6 w-6 md:hidden text-[#0F172A]" />
          <a href="/" className="flex-shrink-0">
            <img 
              src="/serviapp-logo.png" 
              alt="ServiAPP Logo" 
              className="h-28 md:h-32 w-auto object-contain" 
            />
          </a>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4 relative">
          <Input 
            placeholder="¿Qué servicio buscas? (ej. Plomero, Limpieza...)" 
            className="w-full bg-gray-50 text-[#0F172A] pl-4 pr-10 rounded-r-none border-gray-200 focus-visible:ring-[#F97316] focus-visible:ring-offset-0"
          />
          <Button className="rounded-l-none bg-[#F97316] hover:bg-orange-600 text-white border border-[#F97316]">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:flex text-[#0F172A] hover:text-[#F97316] hover:bg-orange-50 font-medium">
            <User className="mr-2 h-4 w-4" />
            Iniciar sesión
          </Button>
          <Button className="bg-[#F97316] hover:bg-orange-600 text-white font-bold shadow-sm hover:shadow-md transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Publicar
          </Button>
        </div>
      </div>
      
      {/* Mobile Search - only visible on small screens */}
      <div className="md:hidden px-4 mt-3 pb-1">
        <div className="flex relative">
          <Input 
            placeholder="Buscar servicios..." 
            className="w-full bg-gray-50 text-[#0F172A] pl-4 pr-10 rounded-md border-gray-200"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </nav>
  );
};