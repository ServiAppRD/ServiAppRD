import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile"; 
import Search from "./pages/Search";
import Publish from "./pages/Publish";
import ServiceDetail from "./pages/ServiceDetail"; 
import NotFound from "./pages/NotFound";
import { MobileNavbar } from "./components/MobileNavbar";
import { DesktopNavbar } from "./components/DesktopNavbar";
import { SplashScreen } from "@/components/SplashScreen";
import { ActivityTracker } from "@/components/ActivityTracker";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

// Componente Layout para manejar el padding condicionalmente
const AppLayout = () => {
  const location = useLocation();
  
  // Scroll automático hacia arriba al cambiar de ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Ocultamos navbar móvil en publicar, login y detalles
  const hideMobileNav = ["/publish", "/login"].includes(location.pathname) || location.pathname.startsWith("/service/") || location.pathname.startsWith("/user/");
  
  // Ocultar Navbar Desktop en Login (queremos pantalla limpia)
  const hideDesktopNav = ["/login"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full">
      {/* Tracker global */}
      <ActivityTracker />

      {/* Navbar Superior (Solo Desktop) */}
      {!hideDesktopNav && <DesktopNavbar />}
      
      {/* Contenedor Principal: En móvil es full width, en desktop es centrado */}
      <div className={`
         w-full 
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
          <Route path="/service/:id" element={<ServiceDetail />} /> 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

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
        <Toaster />
        {/* SplashScreen se muestra sobre todo lo demás */}
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;