import { Home, Search, PlusCircle, User, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 flex justify-between items-center z-[999] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      
      {/* Inicio */}
      <button 
        onClick={() => navigate("/")}
        className={`flex flex-col items-center justify-center gap-1 min-w-[3.5rem] transition-colors ${
          isActive("/") ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Home className="h-6 w-6" />
        <span className="text-[10px] font-medium">Inicio</span>
      </button>

      {/* Buscar */}
      <button 
        onClick={() => navigate("/search")}
        className={`flex flex-col items-center justify-center gap-1 min-w-[3.5rem] transition-colors ${
          isActive("/search") ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Search className="h-6 w-6" />
        <span className="text-[10px] font-medium">Buscar</span>
      </button>

      {/* Publicar (Destacado - Centro) */}
      <div className="relative -top-6">
        <button 
          onClick={() => navigate("/publish")}
          className="bg-[#F97316] text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-transform active:scale-95 border-4 border-gray-50"
        >
          <PlusCircle className="h-8 w-8" />
        </button>
      </div>

      {/* Favoritos */}
      <button 
        onClick={() => navigate("/favorites")}
        className={`flex flex-col items-center justify-center gap-1 min-w-[3.5rem] transition-colors ${
          isActive("/favorites") ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Heart className="h-6 w-6" />
        <span className="text-[10px] font-medium">Favoritos</span>
      </button>

      {/* Cuenta */}
      <button 
        onClick={() => navigate("/profile")}
        className={`flex flex-col items-center justify-center gap-1 min-w-[3.5rem] transition-colors ${
          isActive("/profile") ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <User className="h-6 w-6" />
        <span className="text-[10px] font-medium">Cuenta</span>
      </button>

    </div>
  );
};