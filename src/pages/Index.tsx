import { Navbar } from "@/components/Navbar";
import { ServiceCard } from "@/components/ServiceCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Wrench, Zap, Paintbrush, Truck, Monitor, Scissors } from "lucide-react";

// Empty Data as requested
const featuredServices: any[] = [];
const recentServices: any[] = [];

// Categories are structural navigation, so we keep them, but they don't represent specific fake products.
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

      {/* Categories Bar */}
      <div className="bg-[#0F172A] text-gray-300 py-2 border-t border-gray-800 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between">
          <span className="hover:text-[#FDBA74] cursor-pointer">Categorías y más</span>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Hogar</span>
            <span className="hover:text-white cursor-pointer">Vehículos</span>
            <span className="hover:text-white cursor-pointer">Tecnología</span>
            <span className="hover:text-white cursor-pointer">Eventos</span>
            <span className="hover:text-white cursor-pointer">Salud</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Sidebar Area */}
          <div className="hidden md:block md:col-span-3 space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <h3 className="font-bold text-lg mb-2 text-[#0F172A]">Mejora tu experiencia</h3>
              <p className="text-sm text-gray-500 mb-4">Inicia sesión para gestionar tus servicios y mensajes.</p>
              <div className="space-y-2">
                <Button className="w-full bg-[#0F172A] hover:bg-gray-800">Iniciar sesión</Button>
                <Button variant="outline" className="w-full border-[#FDBA74] text-[#0F172A] hover:bg-orange-50">Crear cuenta</Button>
              </div>
            </div>
            
            <div className="bg-[#FDBA74]/20 p-4 rounded-lg border border-[#FDBA74] text-center">
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
                <Button className="bg-[#FDBA74] text-[#0F172A] hover:bg-white font-bold">Ver ofertas del día</Button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
                <Wrench className="w-64 h-64 text-[#FDBA74]" />
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
                  <Button variant="link" className="text-[#FDBA74]">¡Sé el primero en publicar!</Button>
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