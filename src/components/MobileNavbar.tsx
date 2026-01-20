import { Home, PlusCircle, Heart, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Ocultar la barra de navegación en rutas específicas:
  const shouldHideNavbar = 
    ["/publish", "/login"].includes(location.pathname) || 
    location.pathname.startsWith("/service/");

  if (shouldHideNavbar) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/profile?view=favorites") {
        return location.pathname === "/profile" && location.search.includes("view=favorites");
    }
    return location.pathname === path && !location.search;
  };

  const NavItem = ({ icon: Icon, label, path, action }: any) => (
    <button 
      onClick={action || (() => navigate(path))}
      className={`flex flex-col items-center justify-center gap-1 min-w-[3.5rem] transition-colors ${
        isActive(path) ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <Icon className={`h-6 w-6 ${isActive(path) ? "fill-current" : ""}`} strokeWidth={2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    // Se añade un padding-bottom calculado: área segura + 16px (pb-4) para levantar la barra
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 px-6 flex justify-between items-center z-[999] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavItem icon={Home} label="Inicio" path="/" />
      <NavItem icon={Search} label="Buscar" path="/search" />
      <NavItem icon={PlusCircle} label="Publicar" path="/publish" />
      <NavItem icon={Heart} label="Favoritos" path="/profile?view=favorites" />
      <NavItem icon={Menu} label="Cuenta" path="/profile" />
    </div>
  );
};