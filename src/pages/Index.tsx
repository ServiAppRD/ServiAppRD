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
import { cn } from "@/lib/utils";

const SectionHeader = ({ title, icon: Icon }: { title: string, icon?: any }) => (
  <div className="flex justify-between items-center mb-4 px-4 md:px-0">
    <div className="flex items-center gap-2">
       {Icon && <Icon className="h-5 w-5 text-[#F97316]" />}
       <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
    </div>
    <Link to="/search" className="text-[#F97316] font-semibold text-xs md:text-sm hover:underline bg-orange-50 px-2 py-1 rounded-md transition-colors hover:bg-orange-100">Ver todo</Link>
  </div>
);

// Componente para manejar el Grid vs Carrusel
const ResponsiveGrid = ({ children, isLoading, emptyMessage, icon: Icon }: any) => {
  if (isLoading) return <div className="w-full flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-300" /></div>;
  
  if (!children || children.length === 0) {
     return (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl mx-4 md:mx-0 border border-dashed flex flex-col items-center justify-center">
           {Icon && <Icon className="h-8 w-8 text-gray-300 mb-2" />}
           <p className="text-sm">{emptyMessage}</p>
        </div>
     );
  }

  return (
    <div className={cn(
       "flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar min-h-[100px]", // Mobile Styles
       "md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:overflow-visible md:px-0 md:pb-0 md:gap-6" // Desktop Styles
    )}>
       {children}
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [recommendedCategory, setRecommendedCategory] = useState<string | null>(null);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenAppWelcome");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setShowWelcomeDialog(true), 1500);
      return () => clearTimeout(timer);
    }
    const lastCategory = localStorage.getItem("lastSearchCategory");
    if (lastCategory) setRecommendedCategory(lastCategory);
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcomeDialog(false);
    localStorage.setItem("hasSeenAppWelcome", "true");
  };

  const { data: featuredServices, isLoading: loadingFeatured, refetch: refetchFeatured } = useQuery({
    queryKey: ['featuredServices'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('services').select('*').eq('is_promoted', true).gt('promoted_until', now).is('deleted_at', null).order('promoted_until', { ascending: true }).limit(10);
      if (error) throw error;
      return data;
    }
  });

  const { data: recentServices, isLoading: loadingRecent, refetch: refetchRecent } = useQuery({
    queryKey: ['recentServices'],
    queryFn: async () => {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const { data, error } = await supabase.from('services').select('*').gt('created_at', yesterday.toISOString()).is('deleted_at', null).order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    }
  });

  const { data: recommendedServices, isLoading: loadingRecommended, refetch: refetchRecommended } = useQuery({
    queryKey: ['recommendedServices', recommendedCategory],
    queryFn: async () => {
      if (!recommendedCategory) return [];
      const { data, error } = await supabase.from('services').select('*').eq('category', recommendedCategory).is('deleted_at', null).limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!recommendedCategory
  });

  const handleRefresh = async () => {
    await Promise.all([refetchFeatured(), refetchRecent(), refetchRecommended()]);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20 md:pb-10">
      
      <PullToRefresh onRefresh={handleRefresh}>
        
        {/* Navbar ahora dentro del PullToRefresh y es sticky */}
        <Navbar />

        <AlertDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
          <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto">
            <AlertDialogHeader className="text-center">
              <div className="mx-auto bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-2"><Info className="h-6 w-6 text-[#F97316]" /></div>
              <AlertDialogTitle className="text-xl font-bold text-center">¡Bienvenido a nuestra comunidad beta!</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-600 mt-2">
                <p className="mb-2">Estamos creciendo día a día.</p>
                <p className="mt-2 text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">Si publicas un servicio, ayudas a que la comunidad crezca.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter><AlertDialogAction onClick={handleCloseWelcome} className="w-full bg-[#F97316] hover:bg-orange-600 rounded-xl">Entendido</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Eliminado el margen superior mt-[115px] ya que la navbar ahora ocupa espacio (sticky) */}
        <main className="flex-1 space-y-8 py-6 md:mt-0">
          
          {/* 1. Destacados */}
          <section>
            <SectionHeader title="Profesionales Destacados" icon={Crown} />
            <ResponsiveGrid isLoading={loadingFeatured} emptyMessage="Espacio disponible para destacar" icon={Crown}>
              {featuredServices?.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/service/${item.id}`)} className="h-full">
                    <ServiceCard id={item.id} title={item.title} price={`RD$ ${item.price}`} image={item.image_url || "/placeholder.svg"} badge={{ text: "Top", color: "orange" }} />
                  </div>
              ))}
            </ResponsiveGrid>
          </section>

          {/* 2. Recientes */}
          <section className="-mt-2 md:mt-0">
            <SectionHeader title="Recién Publicados" icon={Clock} />
            <ResponsiveGrid isLoading={loadingRecent} emptyMessage="No hay publicaciones nuevas en las últimas 24h." icon={Clock}>
              {recentServices?.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/service/${item.id}`)} className="h-full">
                    <ServiceCard id={item.id} title={item.title} price={`RD$ ${item.price}`} image={item.image_url || "/placeholder.svg"} badge={{ text: "Nuevo", color: "blue" }} />
                  </div>
              ))}
            </ResponsiveGrid>
          </section>

          {/* 3. Recomendados */}
          <section className="-mt-2 md:mt-0">
            <SectionHeader title={recommendedCategory ? `Porque buscaste: ${recommendedCategory}` : "Recomendados para ti"} icon={Sparkles} />
            <ResponsiveGrid isLoading={loadingRecommended} emptyMessage={recommendedCategory ? "No encontramos más servicios de esta categoría." : "Explora categorías para recibir recomendaciones."} icon={Sparkles}>
              {recommendedServices?.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/service/${item.id}`)} className="h-full">
                    <ServiceCard id={item.id} title={item.title} price={`RD$ ${item.price}`} image={item.image_url} />
                  </div>
              ))}
            </ResponsiveGrid>
          </section>

        </main>
      </PullToRefresh>
    </div>
  );
};

export default Index;