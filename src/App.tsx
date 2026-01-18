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
import { SplashScreen } from "@/components/SplashScreen";
import { ActivityTracker } from "@/components/ActivityTracker";
import { useState } from "react";

const queryClient = new QueryClient();

// Componente Layout para manejar el padding condicionalmente
const AppLayout = () => {
  const location = useLocation();
  // Ocultamos navbar en publicar, login y en el detalle del servicio (SOLO MÓVIL)
  // En desktop, el header superior siempre está, así que el padding bottom no importa tanto para navbar, pero sí para el footer.
  const hideNavbarMobile = ["/publish", "/login"].includes(location.pathname) || location.pathname.startsWith("/service/") || location.pathname.startsWith("/user/");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Tracker funciona globalmente */}
      <ActivityTracker />
      
      {/* CONTENEDOR PRINCIPAL: Centrado en Desktop */}
      <div className={`flex-1 w-full max-w-7xl mx-auto bg-white min-h-screen shadow-2xl shadow-gray-200/50 ${hideNavbarMobile ? "" : "pb-24 md:pb-10"}`}>
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