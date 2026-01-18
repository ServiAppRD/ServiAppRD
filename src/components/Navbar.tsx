import { Search, SlidersHorizontal, PlusCircle, User, Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const tags = ["Plomería", "Electricidad", "Limpieza", "Mecánica", "Carpintería", "Jardinería", "Tecnología", "Belleza"];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className={cn(
      "bg-white sticky top-0 z-50 transition-all duration-500 ease-in-out border-b border-gray-100",
      isScrolled ? "py-2 shadow-md" : "py-3 shadow-sm md:py-4"
    )}>
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* DESKTOP HEADER ROW */}
        <div className="flex items-center justify-between gap-8">
            {/* Logo Area */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/')}>
               <img src="/logo.png" alt="ServiAPP" className="h-8 md:h-10 w-auto object-contain" />
               <span className="font-bold text-xl tracking-tight text-gray-900 hidden md:block">Servi<span className="text-[#F97316]">APP</span></span>
            </div>

            {/* Desktop Navigation & Search */}
            <div className="hidden md:flex flex-1 max-w-2xl items-center gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Buscar servicios (ej. Plomero)..." 
                      className="w-full bg-gray-50 pl-10 pr-4 py-2 h-10 rounded-full border-gray-200 focus:bg-white focus:border-[#F97316] transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
                <div className="flex items-center gap-1">
                   <Button variant="ghost" className="text-gray-600 hover:text-[#F97316]" onClick={() => navigate('/')}>Inicio</Button>
                   <Button variant="ghost" className="text-gray-600 hover:text-[#F97316]" onClick={() => navigate('/search')}>Explorar</Button>
                </div>
            </div>

            {/* Right Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
                <Button 
                   onClick={() => navigate('/publish')}
                   className="bg-[#F97316] hover:bg-orange-600 text-white rounded-full px-5 h-10 font-bold shadow-md shadow-orange-100"
                >
                   <PlusCircle className="mr-2 h-4 w-4" /> Publicar
                </Button>
                
                {session ? (
                   <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                      <Button variant="ghost" size="icon" onClick={() => navigate('/profile?view=favorites')} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                         <Heart className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="rounded-full overflow-hidden border border-gray-200 p-0 w-10 h-10">
                         <User className="h-5 w-5 text-gray-600" />
                      </Button>
                   </div>
                ) : (
                   <Button variant="outline" onClick={() => navigate('/login')} className="rounded-full border-gray-300 font-bold hover:bg-gray-50">
                      Iniciar Sesión
                   </Button>
                )}
            </div>

            {/* MOBILE SEARCH (Solo visible en móviles, reemplaza al header complejo) */}
            <div className="md:hidden flex-1 ml-4">
                <form onSubmit={handleSearch} className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="¿Qué servicio necesitas?" 
                      className="w-full bg-gray-50 pl-10 pr-4 h-10 rounded-full border-gray-200 focus:border-[#F97316] text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>
        </div>

        {/* Categories / Tags Scroll (Visible en ambos pero mejorado) */}
        <div className={cn(
          "flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 transition-all duration-500 ease-in-out origin-top",
          isScrolled 
            ? "max-h-0 opacity-0 py-0 translate-y-[-10px] mt-0" 
            : "max-h-20 opacity-100 pb-1 pt-3 md:pt-4 translate-y-0 mt-0"
        )}>
          {tags.map((tag, i) => (
            <button 
              key={i}
              onClick={() => handleCategoryClick(tag)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-medium border transition-colors bg-gray-50 border-gray-200 text-gray-600 hover:border-[#F97316] hover:text-[#F97316] hover:bg-white"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};