import { Navbar } from "@/components/Navbar";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Wrench, Loader2, Info, Crown, Sparkles, Clock } from "lucide-react";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useNavigate, Link } from "react-router-dom";
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

const SectionHeader = ({ title, icon: Icon }: { title: string, icon?: any }) => (
  <div className="flex justify-between items-center mb-4 px-4">
    <div className="flex items-center gap-2">
       {Icon && <Icon className="h-5 w-5 text-[#F97316]" />}
       <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
    <Link to="/search" className="text-[#F97316] font-semibold text-xs hover:underline bg-orange-50 px-2 py-1 rounded-md">Ver todo</Link>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [recommendedCategory, setRecommendedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si el usuario ya vio el mensaje de bienvenida
    const hasSeenWelcome = localStorage.getItem("hasSeenAppWelcome");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setShowWelcomeDialog(true), 1500);
      return () => clearTimeout(timer);
    }

    // Cargar categoría recomendada
    const lastCategory = localStorage.getItem("lastSearchCategory");
    if (lastCategory) setRecommendedCategory(lastCategory);
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcomeDialog(false);
    localStorage.setItem("hasSeenAppWelcome", "true");
  };

  // --- QUERIES ---

  // 1. Featured Services (Boosted & Active)
  const { data: featuredServices, isLoading: loadingFeatured, refetch: refetchFeatured } = useQuery({
    queryKey: ['featuredServices'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_promoted', true)
        .gt('promoted_until', now) // Solo boosts activos
        .is('deleted_at', null) // No borrados
        .order('promoted_until', { ascending: true }) // Los que vencen antes (o después) según preferencia
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  // 2. Recent Services (Last 24 Hours)
  const { data: recentServices, isLoading: loadingRecent, refetch: refetchRecent } = useQuery({
    queryKey: ['recentServices'],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1); // Restar 1 día

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .gt('created_at', yesterday.toISOString()) // Solo creados en las últimas 24h
        .is('deleted_at', null) // No borrados
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // 3. Recommended Services (Based on history)
  const { data: recommendedServices, isLoading: loadingRecommended, refetch: refetchRecommended } = useQuery({
    queryKey: ['recommendedServices', recommendedCategory],
    queryFn: async () => {
      if (!recommendedCategory) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', recommendedCategory)
        .is('deleted_at', null) // No borrados
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!recommendedCategory // Solo ejecutar si hay categoría
  });

  const handleRefresh = async () => {
    await Promise.all([refetchFeatured(), refetchRecent(), refetchRecommended()]);
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

        <main className="flex-1 space-y-8 py-6">
          
          {/* Banner Promocional */}
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
                <div className="absolute -right-4 -bottom-8 opacity-20 transform rotate-[-15deg]">
                  <Wrench className="w-32 h-32 text-[#F97316]" />
                </div>
              </div>
          </div>

          {/* 1. Profesionales Destacados (Boosted) - Ahora ARRIBA */}
          <section>
            <SectionHeader title="Profesionales Destacados" icon={Crown} />
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar min-h-[100px]">
              {loadingFeatured ? (
                <div className="w-full flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-300" /></div>
              ) : featuredServices && featuredServices.length > 0 ? (
                featuredServices.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/service/${item.id}`)}>
                    <ServiceCard 
                      id={item.id}
                      title={item.title} 
                      price={`RD$ ${item.price}`} 
                      image={item.image_url || "/placeholder.svg"} 
                      badge={{ text: "Top", color: "orange" }}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-6 text-gray-400 bg-orange-50/50 rounded-xl mx-4 border border-orange-100 border-dashed flex flex-col items-center">
                  <Crown className="h-8 w-8 text-orange-200 mb-2" />
                  <p className="text-sm font-medium">Espacio disponible para destacar</p>
                  <Button variant="link" className="text-[#F97316] h-auto p-0 text-xs" onClick={() => navigate('/publish')}>¡Destácate aquí!</Button>
                </div>
              )}
            </div>
          </section>

          {/* 2. Publicados Recientemente (Últimas 24h) */}
          <section className="-mt-2">
            <SectionHeader title="Recién Publicados" icon={Clock} />
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar min-h-[100px]">
              {loadingRecent ? (
                <div className="w-full flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-300" /></div>
              ) : recentServices && recentServices.length > 0 ? (
                recentServices.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/service/${item.id}`)}>
                    <ServiceCard 
                      id={item.id}
                      title={item.title} 
                      price={`RD$ ${item.price}`} 
                      image={item.image_url || "/placeholder.svg"} 
                      badge={{ text: "Nuevo", color: "blue" }}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-400 bg-gray-50 rounded-lg mx-4 border border-dashed text-sm">
                  No hay publicaciones nuevas en las últimas 24h.
                </div>
              )}
            </div>
          </section>

          {/* 3. Recomendados (Basado en historial) */}
          <section className="-mt-2">
            <SectionHeader title={recommendedCategory ? `Porque buscaste: ${recommendedCategory}` : "Recomendados para ti"} icon={Sparkles} />
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar min-h-[100px]">
              {loadingRecommended ? (
                <div className="w-full flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-300" /></div>
              ) : recommendedServices && recommendedServices.length > 0 ? (
                recommendedServices.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/service/${item.id}`)}>
                    <ServiceCard 
                       id={item.id}
                       title={item.title}
                       price={`RD$ ${item.price}`}
                       image={item.image_url}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-400 bg-gray-50 rounded-lg mx-4 border border-dashed text-sm">
                  {recommendedCategory ? "No encontramos más servicios de esta categoría por ahora." : "Explora categorías para recibir recomendaciones personalizadas."}
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