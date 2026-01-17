import { Home, PlusCircle, MessageSquare, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Ocultar la barra de navegación en rutas específicas donde hay botones de acción inferiores
  // o donde se requiere pantalla completa (como Login y Publish)
  if (["/publish", "/login"].includes(location.pathname)) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center z-[999] pb-safe">
      <NavItem icon={Home} label="Inicio" path="/" />
      <NavItem icon={Search} label="Buscar" path="/search" />
      <NavItem icon={PlusCircle} label="Publicar" path="/publish" />
      <NavItem icon={MessageSquare} label="Mensajes" path="/messages" />
      <NavItem icon={Menu} label="Cuenta" path="/profile" />
    </div>
  );
};