import { Navbar } from "@/components/Navbar";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { PullToRefresh } from "@/components/PullToRefresh";

// Empty arrays for now
const recommendedServices: any[] = [];
const featuredServices: any[] = [];

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex justify-between items-end mb-4 px-4">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <a href="#" className="text-[#F97316] font-semibold text-sm hover:underline">Ver todo</a>
  </div>
);

const Index = () => {
  const handleRefresh = async () => {
    // Simulamos carga y recargamos la página para "traer nuevas opciones"
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.reload();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <Navbar />

        <main className="flex-1 space-y-8 py-6">
          
          {/* Banner Promocional - Dark Theme with Orange Wrench */}
          <div className="px-4">
              <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 max-w-lg">
                  <h3 className="text-2xl font-bold mb-2">¡Ofrece tus servicios gratis!</h3>
                  <p className="text-gray-300 text-sm mb-6 max-w-[70%]">Llega a miles de clientes potenciales en tu zona publicando tu perfil profesional.</p>
                  <Button className="bg-[#F97316] text-white hover:bg-orange-600 font-bold border-0 shadow-lg hover:shadow-orange-500/20 transition-all">
                      Publicar Servicio
                  </Button>
                </div>
                {/* Decorative Big Wrench */}
                <div className="absolute -right-6 -bottom-12 opacity-20 transform rotate-[-15deg]">
                  <Wrench className="w-48 h-48 text-[#F97316]" />
                </div>
              </div>
          </div>

          {/* Recommended Section */}
          <section>
            <SectionHeader title="Servicios Recomendados" />
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar min-h-[100px]">
              {recommendedServices.length > 0 ? (
                recommendedServices.map((item) => (
                  <ServiceCard key={item.id} {...item} />
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-400 bg-gray-50 rounded-lg mx-4 border border-dashed">
                  No hay servicios recomendados por el momento.
                </div>
              )}
            </div>
          </section>

          {/* Separator */}
          <div className="h-2 bg-gray-50" />

          {/* Featured Section */}
          <section className="pt-6">
            <SectionHeader title="Profesionales Destacados" />
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar min-h-[100px]">
              {featuredServices.length > 0 ? (
                featuredServices.map((item) => (
                  <ServiceCard key={item.id} {...item} />
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