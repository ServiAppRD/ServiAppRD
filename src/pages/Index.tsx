import { Navbar } from "@/components/Navbar";
import { ServiceCard } from "@/components/ServiceCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Wrench, Zap, Paintbrush, Truck, Monitor, Scissors } from "lucide-react";

// Empty Data as requested
const featuredServices: any[] = [];
const recentServices: any[] = [];

// Categories are structural navigation
const categories = [
  { icon: Wrench, label: "Plomería", count: "0" },
  { icon: Zap, label: "Electricidad", count: "0" },
  { icon: Paintbrush, label: "Limpieza", count: "0" },
  { icon: Truck, label: "Mudanzas", count: "0" },
  { icon: Monitor, label: "Tecnología", count: "0" },
  { icon: Scissors, label: "Belleza", count: "0" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Categories Bar - White theme */}
      <div className="bg-white text-gray-600 py-3 border-b border-gray-200 text-sm hidden md:block shadow-sm">
        <div className="container mx-auto px-4 flex justify-between font-medium">
          <span className="hover:text-[#F97316] cursor-pointer transition-colors">Categorías y más</span>
          <div className="flex gap-6">
            <span className="hover:text-[#F97316] cursor-pointer transition-colors">Hogar</span>
            <span className="hover:text-[#F97316] cursor-pointer transition-colors">Vehículos</span>
            <span className="hover:text-[#F97316] cursor-pointer transition-colors">Tecnología</span>
            <span className="hover:text-[#F97316] cursor-pointer transition-colors">Eventos</span>
            <span className="hover:text-[#F97316] cursor-pointer transition-colors">Salud</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Sidebar Area */}
          <div className="hidden md:block md:col-span-3 space-y-4">
            <div className="bg-[#F97316]/20 p-4 rounded-lg border border-[#F97316] text-center">
              <p className="text-sm font-medium text-[#0F172A]">¿Necesitas ayuda?</p>
              <p className="text-xs text-gray-600 mt-1">Contacta soporte 24/7</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-9 space-y-6">
            
            {/* Featured Banner */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10 max-w-lg">
                <h2 className="text-3xl font-bold mb-2">¡Encuentra al experto ideal!</h2>
                <p className="mb-6 text-gray-300">Desde reparaciones rápidas hasta proyectos grandes. Todo lo que necesitas en un solo lugar.</p>
                <Button className="bg-[#F97316] text-white hover:bg-orange-600 font-bold">Ver ofertas del día</Button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
                <Wrench className="w-64 h-64 text-[#F97316]" />
              </div>
            </div>

            {/* Featured Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#0F172A]">Publicaciones Destacadas</h2>
              </div>
              
              {featuredServices.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredServices.map((service) => (
                    <ServiceCard key={service.id} {...service} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-200">
                  <p className="text-gray-500">No hay servicios destacados en este momento.</p>
                  <Button variant="link" className="text-[#F97316]">¡Sé el primero en publicar!</Button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Popular Categories */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0F172A]">Categorías Populares</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <CategoryIcon key={idx} {...cat} />
            ))}
          </div>
        </div>

        {/* Recent Publications */}
        <div className="space-y-4 pb-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0F172A]">Publicaciones Recientes</h2>
          </div>
          
          {recentServices.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentServices.map((service) => (
                <ServiceCard key={service.id} {...service} />
              ))}
            </div>
          ) : (
             <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-400">Aún no hay publicaciones recientes.</p>
             </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Index;