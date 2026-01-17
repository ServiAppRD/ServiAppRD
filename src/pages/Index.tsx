import { Navbar } from "@/components/Navbar";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";

// Mock Data for Services
const recommendedServices = [
  {
    id: 1,
    title: "Limpieza Profunda de Sofás y Alfombras",
    price: "Desde $1,500",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: { text: "Premium", color: "orange" } as const
  },
  {
    id: 2,
    title: "Técnico en Refrigeración e Inverter",
    price: "Cotizar",
    image: "https://images.unsplash.com/photo-1581094794329-cd67bce3a970?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: { text: "Verificado", color: "blue" } as const
  },
  {
    id: 3,
    title: "Plomero 24/7 Emergencias",
    price: "$500 / Visita",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  }
];

const featuredServices = [
  {
    id: 4,
    title: "Mecánico a Domicilio - Diagnóstico",
    price: "$800",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: { text: "Destacado", color: "yellow" } as const
  },
  {
    id: 5,
    title: "Jardinería y Paisajismo",
    price: "Cotizar",
    image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 6,
    title: "Instalación de Cámaras de Seguridad",
    price: "Desde $3,000",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: { text: "Empresa", color: "blue" } as const
  }
];

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex justify-between items-end mb-4 px-4">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <a href="#" className="text-[#F97316] font-semibold text-sm hover:underline">Ver todo</a>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <Navbar />

      <main className="flex-1 space-y-8 py-6">
        
        {/* Banner Promocional */}
        <div className="px-4">
            <div className="bg-[#F97316] rounded-2xl p-6 text-white shadow-lg shadow-orange-200">
                <h3 className="text-xl font-bold mb-2">¡Ofrece tus servicios gratis!</h3>
                <p className="text-orange-100 text-sm mb-4">Llega a miles de clientes potenciales en tu zona.</p>
                <Button variant="secondary" className="bg-white text-[#F97316] hover:bg-orange-50 font-bold border-0">
                    Publicar Servicio
                </Button>
            </div>
        </div>

        {/* Recommended Section */}
        <section>
          <SectionHeader title="Servicios Recomendados" />
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
            {recommendedServices.map((item) => (
              <ServiceCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        {/* Separator */}
        <div className="h-2 bg-gray-50" />

        {/* Featured Section */}
        <section className="pt-6">
          <SectionHeader title="Profesionales Destacados" />
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
            {featuredServices.map((item) => (
              <ServiceCard key={item.id} {...item} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Index;