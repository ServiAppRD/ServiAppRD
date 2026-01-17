import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Publish from "./pages/Publish";
import ServiceDetail from "./pages/ServiceDetail"; // Nueva importación
import NotFound from "./pages/NotFound";
import { MobileNavbar } from "./components/MobileNavbar";

const queryClient = new QueryClient();

// Componente Layout para manejar el padding condicionalmente
const AppLayout = () => {
  const location = useLocation();
  // Ocultamos navbar en publicar, login y en el detalle del servicio
  const hideNavbar = ["/publish", "/login"].includes(location.pathname) || location.pathname.startsWith("/service/");

  return (
    <div className={hideNavbar ? "" : "pb-24"}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/service/:id" element={<ServiceDetail />} /> {/* Nueva ruta */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MobileNavbar />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;