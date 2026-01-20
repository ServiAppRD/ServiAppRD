import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wrench, Loader2, Info, Crown, Sparkles, Clock, 
  Search, Droplets, Zap, Car, Laptop, ArrowRight, Grid
} from "lucide-react";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

const SectionHeader = ({ title, icon: Icon }: { title: string, icon?: any }) => (
  <div className="flex justify-between items-center mb-4 px-5 md:px-0">
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
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl mx-4 md:mx-0 border border-dashed flex flex-col items-center justify-center px-6">
           {Icon && <Icon className="h-8 w-8 text-gray-300 mb-2" />}
           <p className="text-sm font-medium">{emptyMessage}</p>
        </div>
     );
  }

  return (
    <div className={cn(
       "flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar min-h-[100px]", // Mobile Styles
       "md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:overflow-visible md:px-0 md:pb-0 md:gap-6" // Desktop Styles
    )}>
       {children}
    </div>
  );
};

// Datos del Carrusel Hero
const HERO_SLIDES = [
  {
    id: 1,
    title: "Expertos en\nElectricidad",
    subtitle: "Instalaciones seguras y rápidas",
    image: "/hero-electrician.png",
    cta: "Buscar Electricista",
    category: "Electricidad"
  },
  {
    id: 2,
    title: "Carpintería\nde Primera",
    subtitle: "Muebles y reparaciones a medida",
    image: "/hero-carpenter.png",
    cta: "Ver Carpinteros",
    category: "Carpintería"
  },
  {
    id: 3,
    title: "Plomería\n24 Horas",
    subtitle: "Soluciones para tu hogar",
    image: "/hero-plumber.png",
    cta: "Encontrar Plomero",
    category: "Plomería"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [recommendedCategory, setRecommendedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Carousel State
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  // Helper para obtener IDs bloqueados
  const getBlockedIds = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];
    const { data } = await supabase.from('blocked_users').select('blocked_user_id').eq('blocker_id', session.user.id);
    return data?.map(b => b.blocked_user_id) || [];
  };

  const { data: featuredServices, isLoading: loadingFeatured, refetch: refetchFeatured } = useQuery({
    queryKey: ['featuredServices'],
    queryFn: async () => {
      const blockedIds = await getBlockedIds();
      const now = new Date().toISOString();
      let query = supabase.from('services').select('*').eq('is_promoted', true).gt('promoted_until', now).is('deleted_at', null).order('promoted_until', { ascending: true }).limit(10);
      
      if (blockedIds.length > 0) query = query.not('user_id', 'in', `(${blockedIds.join(',')})`);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: recentServices, isLoading: loadingRecent, refetch: refetchRecent } = useQuery({
    queryKey: ['recentServices'],
    queryFn: async () => {
      const blockedIds = await getBlockedIds();
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      let query = supabase.from('services').select('*').gt('created_at', yesterday.toISOString()).is('deleted_at', null).order('created_at', { ascending: false }).limit(10);
      
      if (blockedIds.length > 0) query = query.not('user_id', 'in', `(${blockedIds.join(',')})`);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: recommendedServices, isLoading: loadingRecommended, refetch: refetchRecommended } = useQuery({
    queryKey: ['recommendedServices', recommendedCategory],
    queryFn: async () => {
      if (!recommendedCategory) return [];
      const blockedIds = await getBlockedIds();
      let query = supabase.from('services').select('*').eq('category', recommendedCategory).is('deleted_at', null).limit(10);
      
      if (blockedIds.length > 0) query = query.not('user_id', 'in', `(${blockedIds.join(',')})`);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleRefresh = async () => {
    await Promise.all([refetchFeatured(), refetchRecent(), refetchRecommended()]);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      
      {/* 
        HERO SECTION - ASYMMETRICAL BORDER & CAROUSEL
      */}
      <div className="relative bg-[#F97316] rounded-bl-[0px] rounded-br-[70px] pt-safe shadow-lg overflow-hidden min-h-[300px] flex flex-col">
        
        {/* Search Bar (Fixed at top of Hero) */}
        <div className="px-5 pt-4 pb-2 relative z-30">
            <form onSubmit={handleSearch} className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#F97316] p-1.5 rounded-full">
                    <Search className="h-4 w-4 text-white" strokeWidth={3} />
                </div>
                <Input 
                  placeholder="¿Qué servicio necesitas?" 
                  className="w-full h-12 pl-14 pr-4 rounded-full border-none shadow-md text-base bg-white placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>
        </div>

        {/* Swipeable Carousel */}
        <div className="relative z-10 flex-1 flex flex-col justify-end pb-8">
          <Carousel 
            setApi={setApi} 
            className="w-full h-full"
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
          >
            <CarouselContent className="h-full">
              {HERO_SLIDES.map((slide) => (
                <CarouselItem key={slide.id} className="h-full">
                  <div className="relative px-6 pb-2 pt-4 flex items-center justify-between h-[220px]">
                    {/* Texto a la Izquierda */}
                    <div className="text-white space-y-3 max-w-[55%] z-20 relative flex flex-col justify-center h-full">
                      <h1 className="text-3xl font-black leading-[1.1] tracking-tight whitespace-pre-line drop-shadow-sm">
                        {slide.title}
                      </h1>
                      <p className="text-orange-50 text-xs font-semibold tracking-wide">
                        {slide.subtitle}
                      </p>
                      <button 
                        onClick={() => navigate(`/search?category=${slide.category}`)} 
                        className="w-fit bg-white text-[#F97316] px-5 py-2.5 rounded-full text-xs font-bold shadow-lg hover:bg-orange-50 transition-all active:scale-95"
                      >
                        {slide.cta}
                      </button>
                    </div>

                    {/* Imagen a la Derecha - Pegada al fondo y Ajustada */}
                    <div className="absolute -right-4 -bottom-8 w-[60%] h-[120%] flex items-end justify-end pointer-events-none z-10">
                      <img 
                        src={slide.image} 
                        className="w-full h-full object-contain object-bottom drop-shadow-2xl" 
                        alt={slide.title}
                        style={{ filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.25))" }}
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-6 flex gap-1.5 z-20">
            {HERO_SLIDES.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  current === index ? "w-6 bg-white opacity-100 shadow-sm" : "w-1.5 bg-white opacity-40"
                )}
              />
            ))}
        </div>
      </div>

      <AlertDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-2"><Info className="h-6 w-6 text-[#F97316]" /></div>
            <AlertDialogTitle className="text-xl font-bold text-center">¡Bienvenido a ServiAPP!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 mt-2">
              <p className="mb-2">Estamos creciendo día a día.</p>
              <p className="mt-2 text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">Si publicas un servicio, ayudas a que la comunidad crezca.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction onClick={handleCloseWelcome} className="w-full bg-[#F97316] hover:bg-orange-600 rounded-xl">Entendido</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PullToRefresh onRefresh={handleRefresh}>
        
        {/* CATEGORIES GRID */}
        <div className="px-5 mt-6 mb-8 space-y-3">
            {/* Fila 1: Tarjetas Grandes */}
            <div className="grid grid-cols-2 gap-3">
                <div onClick={() => navigate('/search?category=Plomería')} className="bg-blue-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-md transition-all border border-blue-100 h-32 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Droplets className="w-16 h-16 text-blue-500" /></div>
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 mb-1 z-10"><Droplets className="h-6 w-6" /></div>
                     <span className="font-bold text-gray-700 z-10">Plomería</span>
                </div>
                <div onClick={() => navigate('/search?category=Electricidad')} className="bg-yellow-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-md transition-all border border-yellow-100 h-32 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="w-16 h-16 text-yellow-500" /></div>
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-yellow-500 mb-1 z-10"><Zap className="h-6 w-6" /></div>
                     <span className="font-bold text-gray-700 z-10">Electricidad</span>
                </div>
            </div>
            
            {/* Fila 2: Tarjetas Pequeñas */}
            <div className="grid grid-cols-4 gap-3">
                 <CategorySmallIcon icon={Sparkles} label="Limpieza" color="text-purple-500" bg="bg-purple-50" onClick={() => navigate('/search?category=Limpieza')} />
                 <CategorySmallIcon icon={Car} label="Mecánica" color="text-gray-600" bg="bg-gray-100" onClick={() => navigate('/search?category=Mecánica')} />
                 <CategorySmallIcon icon={Laptop} label="Tecnología" color="text-cyan-500" bg="bg-cyan-50" onClick={() => navigate('/search?category=Tecnología')} />
                 <CategorySmallIcon icon={Grid} label="Ver todo" color="text-[#F97316]" bg="bg-orange-50" onClick={() => navigate('/search')} />
            </div>
        </div>

        <main className="space-y-8">
          
          {/* 1. Destacados */}
          <section>
            <SectionHeader title="Profesionales Destacados" icon={Crown} />
            <ResponsiveGrid isLoading={loadingFeatured} emptyMessage="¡Vaya! Parece que no hay servicios destacados aún. ¿Quieres ser el primero?" icon={Crown}>
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
            <ResponsiveGrid isLoading={loadingRecent} emptyMessage="¡Vaya! Parece que no hay servicios recientes aún. ¿Quieres ser el primero?" icon={Clock}>
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
            <ResponsiveGrid isLoading={loadingRecommended} emptyMessage={recommendedCategory ? "¡Vaya! Parece que no hay recomendaciones aún. ¿Quieres ser el primero?" : "Explora categorías para recibir recomendaciones."} icon={Sparkles}>
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

// Componente helper para iconos pequeños
const CategorySmallIcon = ({ icon: Icon, label, color, bg, onClick }: any) => (
    <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group">
        <div className={cn("w-full aspect-square rounded-2xl flex items-center justify-center transition-all group-active:scale-95", bg)}>
            <Icon className={cn("h-6 w-6", color)} />
        </div>
        <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">{label}</span>
    </div>
);

export default Index;