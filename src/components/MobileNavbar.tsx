import { Home, Search, PlusCircle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
      
      {/* Inicio */}
      <button 
        onClick={() => navigate("/")}
        className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${
          isActive("/") ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Home className="h-6 w-6" />
        <span className="text-[10px] font-medium">Inicio</span>
      </button>

      {/* Buscar (Agregado para balancear) */}
      <button 
        onClick={() => navigate("/search")}
        className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${
          isActive("/search") ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Search className="h-6 w-6" />
        <span className="text-[10px] font-medium">Buscar</span>
      </button>

      {/* Publicar (Destacado) */}
      <div className="relative -top-5">
        <button 
          onClick={() => navigate("/publish")}
          className="bg-[#F97316] text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-transform active:scale-95 border-4 border-white"
        >
          <PlusCircle className="h-7 w-7" />
        </button>
      </div>

      {/* Cuenta */}
      <button 
        onClick={() => navigate("/profile")}
        className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${
          isActive("/profile") ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <User className="h-6 w-6" />
        <span className="text-[10px] font-medium">Cuenta</span>
      </button>

    </div>
  );
};