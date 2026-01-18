import { Navbar } from "@/components/Navbar";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Wrench, Loader2, Info } from "lucide-react";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex justify-between items-end mb-4 px-4">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <a href="/search" className="text-[#F97316] font-semibold text-sm hover:underline">Ver todo</a>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya vio el mensaje de bienvenida
    const hasSeenWelcome = localStorage.getItem("hasSeenAppWelcome");
    if (!hasSeenWelcome) {
      // Pequeño delay para que no sea intrusivo inmediatamente
      const timer = setTimeout(() => setShowWelcomeDialog(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcomeDialog(false);
    localStorage.setItem("hasSeenAppWelcome", "true");
  };

  // Fetch recent services from Supabase
  const { data: recentServices, isLoading, refetch } = useQuery({
    queryKey: ['recentServices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  // Placeholder for other sections (could be filtered queries later)
  const recommendedServices: any[] = [];
  const featuredServices: any[] = [];

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <Navbar />

        <AlertDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
          <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto">
            <AlertDialogHeader className="text-center">
              <div className="mx-auto bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Info className="h-6 w-6 text-[#F97316]" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-center">¡Bienvenido a nuestra comunidad beta!</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-600 mt-2">
                <p className="mb-2">Esta aplicación es nueva y estamos creciendo día a día.</p>
                <p>Es posible que al principio no encuentres muchos servicios cerca de ti, <strong>¡pero tú puedes ayudarnos!</strong></p>
                <p className="mt-2 text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                  Si publicas un servicio, ayudas a que la comunidad crezca. Próximamente llegarán muchos más usuarios y clientes.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCloseWelcome} className="w-full bg-[#F97316] hover:bg-orange-600 rounded-xl">
                Entendido, ¡gracias!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <main className="flex-1 space-y-6 py-6">
          
          {/* Banner Promocional - Más Compacto */}
          <div className="px-4">
              <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-xl p-5 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 max-w-lg">
                  <h3 className="text-lg font-bold mb-1">¡Ofrece tus servicios gratis!</h3>
                  <p className="text-gray-300 text-xs mb-3 max-w-[70%]">Llega a miles de clientes potenciales en tu zona.</p>
                  <Button 
                    onClick={() => navigate('/publish')}
                    size="sm"
                    className="bg-[#F97316] text-white hover:bg-orange-600 font-bold border-0 shadow-lg hover:shadow-orange-500/20 transition-all h-9 text-xs"
                  >
                      Publicar Servicio
                  </Button>
                </div>
                {/* Decorative Big Wrench - Smaller */}
                <div className="absolute -right-4 -bottom-8 opacity-20 transform rotate-[-15deg]">
                  <Wrench className="w-32 h-32 text-[#F97316]" />
                </div>
              </div>
          </div>

          {/* New Section: Recently Published */}
          <section>
            <SectionHeader title="Publicados Recientemente" />
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar min-h-[100px]">
              {isLoading ? (
                <div className="w-full flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                </div>
              ) : recentServices && recentServices.length > 0 ? (
                recentServices.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/service/${item.id}`)}>
                    <ServiceCard 
                      id={item.id}
                      title={item.title} 
                      price={`RD$ ${item.price}`} 
                      image={item.image_url || "/placeholder.svg"} 
                      badge={item.is_promoted ? { text: "Nuevo", color: "blue" } : undefined}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-400 bg-gray-50 rounded-lg mx-4 border border-dashed">
                  No hay servicios recientes.
                </div>
              )}
            </div>
          </section>

          {/* Recommended Section - Close to previous one */}
          <section className="-mt-2">
            <SectionHeader title="Servicios Recomendados" />
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar min-h-[100px]">
              {recommendedServices.length > 0 ? (
                recommendedServices.map((item) => (
                  <ServiceCard key={item.id} {...item} />
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-400 bg-gray-50 rounded-lg mx-4 border border-dashed">
                  Pronto veremos recomendaciones para ti.
                </div>
              )}
            </div>
          </section>

          {/* Featured Section */}
          <section>
            <SectionHeader title="Profesionales Destacados" />
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar min-h-[100px]">
              {featuredServices.length > 0 ? (
                featuredServices.map((item) => (
                  <ServiceCard key={item.id} id={item.id} {...item} />
                ))
              ) : (
                 <div className="w-full text-center py-8 text-gray-400 bg-gray-50 rounded-lg mx-4 border border-dashed">
                  Sé el primero en destacar tu servicio.
                </div>
              )}
            </div>
          </section>

        </main>
      </div>
    </PullToRefresh>
  );
};

export default Index;