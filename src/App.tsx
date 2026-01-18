import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile"; // Importar nuevo componente
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
  // Ocultamos navbar en publicar, login y en el detalle del servicio
  const hideNavbar = ["/publish", "/login"].includes(location.pathname) || location.pathname.startsWith("/service/") || location.pathname.startsWith("/user/");

  return (
    <div className={hideNavbar ? "" : "pb-24"}>
      {/* El Tracker funciona globalmente dentro del Router */}
      <ActivityTracker />
      
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:id" element={<PublicProfile />} /> {/* Ruta Publica */}
        <Route path="/search" element={<Search />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/service/:id" element={<ServiceDetail />} /> 
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MobileNavbar />
    </div>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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