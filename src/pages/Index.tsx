import { Navbar } from "@/components/Navbar";
import { ServiceCard } from "@/components/ServiceCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Wrench, Zap, Paintbrush, Truck, Monitor, Scissors } from "lucide-react";

// Mock Data
const featuredServices = [
  {
    id: 1,
    title: "Servicio de Plomería Residencial 24/7",
    price: "RD$ 1,500",
    location: "Distrito Nacional",
    category: "Plomería",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800",
    isFeatured: true
  },
  {
    id: 2,
    title: "Instalación de Aires Acondicionados Inverter",
    price: "RD$ 2,500",
    location: "Santo Domingo Este",
    category: "Climatización",
    image: "https://images.unsplash.com/photo-1621905476059-08b537fba6b3?auto=format&fit=crop&q=80&w=800",
    isFeatured: true
  }
];

const recentServices = [
  {
    id: 3,
    title: "Limpieza Profunda de Sofás y Alfombras",
    price: "RD$ 800",
    location: "Santiago",
    category: "Limpieza",
    image: "https://images.unsplash.com/photo-1581578731117-104f2a921a29?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    title: "Mecánico a Domicilio - Diagnóstico Computarizado",
    price: "RD$ 1,200",
    location: "Santo Domingo Norte",
    category: "Mecánica",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 5,
    title: "Clases de Matemáticas y Física",
    price: "RD$ 500/hr",
    location: "Distrito Nacional",
    category: "Tutorías",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 6,
    title: "Mudanzas Pequeñas y Medianas",
    price: "A convenir",
    location: "Bavaro",
    category: "Transporte",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 7,
    title: "Reparación de Celulares y Tablets",
    price: "RD$ 800",
    location: "La Vega",
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800"
  }
];

const categories = [
  { icon: Wrench, label: "Plomería", count: "1,203" },
  { icon: Zap, label: "Electricidad", count: "892" },
  { icon: Paintbrush, label: "Limpieza", count: "2,341" },
  { icon: Truck, label: "Mudanzas", count: "543" },
  { icon: Monitor, label: "Tecnología", count: "765" },
  { icon: Scissors, label: "Belleza", count: "1,890" },
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
        
        {/* Top Section with Sidebar like Reference */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Sidebar Area (Left in reference) */}
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

          {/* Main Content Area (Right in reference) */}
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
                <a href="#" className="text-[#FDBA74] text-sm hover:underline font-medium">Ver más &gt;</a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredServices.map((service) => (
                  <ServiceCard key={service.id} {...service} />
                ))}
                {/* Adding a placeholder card to fill space visually if needed */}
                <div className="hidden lg:flex items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#FDBA74]">
                  <div>
                    <p className="font-semibold text-gray-500">¿Quieres ver tu anuncio aquí?</p>
                    <Button variant="link" className="text-[#FDBA74]">Publicar ahora</Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Popular Categories */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0F172A]">Categorías Populares</h2>
            <a href="#" className="text-sm text-blue-600 hover:underline">Ver más categorías &gt;</a>
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
            <a href="#" className="text-sm text-blue-600 hover:underline">Explorar más &gt;</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentServices.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Index;