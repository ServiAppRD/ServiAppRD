import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, User, Heart, Crown, LayoutDashboard, Briefcase, BarChart3, Settings, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DesktopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPlus, setIsPlus] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('first_name, last_name, avatar_url, is_plus').eq('id', session.user.id).single();
        if (data) {
           setProfileData(data);
           setAvatarUrl(data.avatar_url);
           setIsPlus(data.is_plus || false);
        }
      } else {
        setUser(null);
        setProfileData(null);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            setUser(session.user);
            getUser();
        } else {
            setUser(null);
            setProfileData(null);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
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
          
          <Link to="/profile/favorites">
             <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#F97316] hover:bg-orange-50">
                <Heart className="h-5 w-5" />
             </Button>
          </Link>

          <Link to="/publish">
            <Button className="bg-[#F97316] hover:bg-orange-600 text-white rounded-xl px-6 font-bold shadow-lg shadow-orange-100 transition-all hover:-translate-y-0.5">
              <PlusCircle className="mr-2 h-4 w-4" /> Publicar
            </Button>
          </Link>

          {/* Profile Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-100 cursor-pointer hover:opacity-80 transition-opacity group">
                  <div className="text-right hidden lg:block">
                    <div className="flex items-center justify-end gap-1">
                       <p className="text-xs font-bold text-gray-900 max-w-[100px] truncate">
                          {profileData?.first_name || "Mi Cuenta"}
                       </p>
                       {isPlus && (
                          <span className="bg-[#0239c7] text-white text-[9px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                             <Crown className="h-2 w-2 fill-white" />
                             PLUS
                          </span>
                       )}
                    </div>
                    <p className="text-[10px] text-gray-500 flex items-center justify-end gap-1">
                        Gestión <ChevronDown className="h-3 w-3" />
                    </p>
                  </div>
                  <Avatar className={`h-10 w-10 border-2 transition-all ${isPlus ? "border-[#0239c7] ring-2 ring-blue-50" : "border-orange-100 group-hover:border-orange-200"}`}>
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-orange-50 text-[#F97316] font-bold">
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 rounded-2xl shadow-xl border-gray-100 bg-white mr-4" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-3 pt-3 pb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-gray-900 leading-none">
                        {profileData?.first_name ? `${profileData.first_name} ${profileData.last_name || ''}` : "Mi Cuenta"}
                    </p>
                    <p className="text-xs leading-none text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 my-2" />
                <div className="space-y-1">
                    {/* Updated Link: Points to /profile/edit */}
                    <DropdownMenuItem onClick={() => navigate('/profile/edit')} className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-orange-50 focus:text-[#F97316]">
                      <LayoutDashboard className="mr-3 h-4 w-4" />
                      <span className="font-medium">Mi Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile/publications')} className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-orange-50 focus:text-[#F97316]">
                      <Briefcase className="mr-3 h-4 w-4" />
                      <span className="font-medium">Mis Publicaciones</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile/metrics')} className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-orange-50 focus:text-[#F97316]">
                      <BarChart3 className="mr-3 h-4 w-4" />
                      <span className="font-medium">Métricas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile/account')} className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-orange-50 focus:text-[#F97316]">
                      <Settings className="mr-3 h-4 w-4" />
                      <span className="font-medium">Administrar Cuenta</span>
                    </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 my-2" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl px-3 py-2.5 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="ml-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 text-gray-700">
                Ingresar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};