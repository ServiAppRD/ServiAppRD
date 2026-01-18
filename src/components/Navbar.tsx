import { Search, PlusCircle, User, Heart, Home, Menu, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();
  
  const tags = ["Plomería", "Electricidad", "Limpieza", "Mecánica", "Carpintería", "Jardinería", "Tecnología", "Belleza"];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        // Cargar avatar si existe sesión
        supabase.from('profiles').select('avatar_url').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data?.avatar_url) setAvatarUrl(data.avatar_url);
          });
      }
    });
    
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAvatarUrl("");
    navigate("/");
  };

  return (
    <div className={cn(
      "bg-white sticky top-0 z-50 transition-all duration-500 ease-in-out border-b border-gray-100",
      isScrolled ? "py-2 shadow-md" : "py-3 shadow-sm md:py-4"
    )}>
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* HEADER ROW */}
        <div className="flex items-center justify-between gap-8">
            {/* Logo Area - Visible only on Desktop */}
            <div className="hidden md:flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/')}>
               <img src="/logo.png" alt="ServiAPP" className="h-8 md:h-10 w-auto object-contain" />
               <span className="font-bold text-xl tracking-tight text-gray-900">Servi<span className="text-[#F97316]">APP</span></span>
            </div>

            {/* Desktop Search (Centered) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-auto items-center">
                <form onSubmit={handleSearch} className="w-full relative shadow-sm rounded-full hover:shadow-md transition-shadow">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-[#F97316] rounded-full text-white">
                       <Search className="h-4 w-4" />
                    </div>
                    <Input 
                      placeholder="Buscar servicios (ej. Plomero)..." 
                      className="w-full bg-white pl-12 pr-4 py-6 h-12 rounded-full border-gray-200 focus:border-[#F97316] transition-all text-base shadow-inner"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            {/* Right Actions (Desktop Menu) */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
                <Button 
                   onClick={() => navigate('/publish')}
                   className="bg-transparent hover:bg-gray-50 text-gray-600 hover:text-black border border-transparent hover:border-gray-200 rounded-full h-10 font-semibold transition-all"
                   variant="ghost"
                >
                   Publicar tu servicio
                </Button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                           variant="outline" 
                           className="rounded-full border-gray-300 pl-3 pr-2 py-5 h-auto flex items-center gap-2 hover:shadow-md transition-all ml-1 bg-white"
                        >
                            <Menu className="h-5 w-5 text-gray-600" />
                            <Avatar className="h-8 w-8 border border-gray-200">
                                <AvatarImage src={avatarUrl} className="object-cover" />
                                <AvatarFallback className="bg-gray-100 text-gray-400">
                                  <User className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 rounded-xl p-2 shadow-xl border-gray-100 bg-white mt-2">
                         {session ? (
                             <>
                                <DropdownMenuLabel className="font-bold text-gray-900">Mi Cuenta</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg cursor-pointer py-2.5 hover:bg-gray-50">
                                    <User className="mr-3 h-4 w-4 text-gray-500" /> Perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/profile?view=favorites')} className="rounded-lg cursor-pointer py-2.5 hover:bg-gray-50">
                                    <Heart className="mr-3 h-4 w-4 text-gray-500" /> Favoritos
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/profile?view=metrics')} className="rounded-lg cursor-pointer py-2.5 hover:bg-gray-50">
                                    <Settings className="mr-3 h-4 w-4 text-gray-500" /> Gestionar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/')} className="rounded-lg cursor-pointer py-2.5 hover:bg-gray-50">
                                    <Home className="mr-3 h-4 w-4 text-gray-500" /> Inicio
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/search')} className="rounded-lg cursor-pointer py-2.5 hover:bg-gray-50">
                                    <Search className="mr-3 h-4 w-4 text-gray-500" /> Explorar Servicios
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 py-2.5">
                                    <LogOut className="mr-3 h-4 w-4" /> Cerrar Sesión
                                </DropdownMenuItem>
                             </>
                         ) : (
                             <>
                                <DropdownMenuItem onClick={() => navigate('/login')} className="font-bold rounded-lg cursor-pointer py-2.5 hover:bg-gray-50 text-gray-900">
                                    Iniciar Sesión
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/login')} className="rounded-lg cursor-pointer py-2.5 hover:bg-gray-50">
                                    Registrarse
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                 <DropdownMenuItem onClick={() => navigate('/')} className="rounded-lg cursor-pointer py-2.5 hover:bg-gray-50">
                                    <Home className="mr-3 h-4 w-4 text-gray-500" /> Inicio
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/search')} className="rounded-lg cursor-pointer py-2.5 hover:bg-gray-50">
                                    <Search className="mr-3 h-4 w-4 text-gray-500" /> Explorar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/publish')} className="rounded-lg cursor-pointer py-2.5 hover:bg-gray-50">
                                    <PlusCircle className="mr-3 h-4 w-4 text-gray-500" /> Publicar un servicio
                                </DropdownMenuItem>
                             </>
                         )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* MOBILE SEARCH (Visible only on mobile) */}
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

        {/* Categories / Tags Scroll */}
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