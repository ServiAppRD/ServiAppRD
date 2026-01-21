import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile"; 
import Search from "./pages/Search";
import Publish from "./pages/Publish";
import EditService from "./pages/EditService";
import ServiceDetail from "./pages/ServiceDetail"; 
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AccountElimination from "./pages/AccountElimination";
import { MobileNavbar } from "./components/MobileNavbar";
import { DesktopNavbar } from "./components/DesktopNavbar";
import { Footer } from "./components/Footer";
import { SplashScreen } from "@/components/SplashScreen";
import { ActivityTracker } from "@/components/ActivityTracker";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Componente Layout para manejar el padding condicionalmente
const AppLayout = () => {
  const location = useLocation();
  
  // Scroll automático hacia arriba al cambiar de ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Ocultamos navbar móvil en publicar, login, detalles y editar
  const hideMobileNav = ["/publish", "/login"].includes(location.pathname) || location.pathname.startsWith("/service/") || location.pathname.startsWith("/user/") || location.pathname.startsWith("/edit-service/") || location.pathname === "/account-elimination";
  
  // Ocultar Navbar Desktop en Login
  const hideDesktopNav = ["/login", "/account-elimination"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full flex flex-col">
      {/* Tracker global */}
      <ActivityTracker />

      {/* Navbar Superior (Solo Desktop) */}
      {!hideDesktopNav && <DesktopNavbar />}

      {/* Banner de Instalación (Visible en Web/Mobile Web) */}
      <InstallAppBanner />
      
      {/* Contenedor Principal */}
      <div className={`
         w-full flex-1
         ${!hideMobileNav ? "pb-24 md:pb-0" : ""} 
         md:max-w-7xl md:mx-auto md:px-6 md:pt-6
      `}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<PublicProfile />} /> 
          <Route path="/search" element={<Search />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/edit-service/:id" element={<EditService />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/account-elimination" element={<AccountElimination />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Footer solo visible en Desktop */}
      {!hideDesktopNav && <Footer />}

      {/* Navbar Inferior (Solo Móvil) */}
      <MobileNavbar />
    </div>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;