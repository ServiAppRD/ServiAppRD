import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, User, Heart, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const DesktopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPlus, setIsPlus] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('avatar_url, is_plus').eq('id', session.user.id).single();
        if (data) {
           setAvatarUrl(data.avatar_url);
           setIsPlus(data.is_plus || false);
        }
      }
    };
    getUser();
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="hidden md:block sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="ServiAPP" className="h-14 w-auto object-contain" />
        </Link>

        {/* Search Bar - Centered */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="¿Qué servicio estás buscando?" 
            className="w-full pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#F97316] rounded-xl transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/search">
            <Button variant="ghost" className={`font-medium ${isActive('/search') ? 'text-[#F97316]' : 'text-gray-600'}`}>
              Explorar
            </Button>
          </Link>
          
          <Link to="/profile?view=favorites">
             <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#F97316] hover:bg-orange-50">
                <Heart className="h-5 w-5" />
             </Button>
          </Link>

          <Link to="/publish">
            <Button className="bg-[#F97316] hover:bg-orange-600 text-white rounded-xl px-6 font-bold shadow-lg shadow-orange-100 transition-all hover:-translate-y-0.5">
              <PlusCircle className="mr-2 h-4 w-4" /> Publicar
            </Button>
          </Link>

          {/* Profile Dropdown / Link */}
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden lg:block">
                <div className="flex items-center justify-end gap-1">
                   <p className="text-xs font-bold text-gray-900">Mi Cuenta</p>
                   {isPlus && (
                      <span className="bg-[#0239c7] text-white text-[9px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                         <Crown className="h-2 w-2 fill-white" />
                         PLUS
                      </span>
                   )}
                </div>
                <p className="text-[10px] text-gray-500">Gestión</p>
              </div>
              <Avatar className={`h-10 w-10 border-2 ${isPlus ? "border-[#0239c7]" : "border-orange-100"}`}>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-orange-50 text-[#F97316] font-bold">
                    <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="ml-2 border-gray-200 rounded-xl font-bold">
                Ingresar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};