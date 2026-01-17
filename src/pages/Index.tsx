import { Navbar } from "@/components/Navbar";
import { ServiceCard } from "@/components/ServiceCard";

// Mock Data matching the style
const recommendedItems = [
  {
    id: 1,
    title: "Venta de Motor Kove 500x (2023)",
    price: "USD$7,000",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: { text: "Dealer", color: "blue" } as const
  },
  {
    id: 2,
    title: "Harley Davidson Sporster XL1200",
    price: "USD$6,500",
    image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    title: "Yamaha MT-09 2024 Cero Kilometros",
    price: "USD$12,900",
    image: "https://images.unsplash.com/photo-1615172282427-9a5752d6486d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: { text: "Nuevo", color: "gray" } as const
  }
];

const featuredItems = [
  {
    id: 4,
    title: "Juego de Habitación Moderno King Size",
    price: "$24,000",
    image: "https://images.unsplash.com/photo-1505693416388-b0346ef41492?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: { text: "Tienda", color: "yellow" } as const
  },
  {
    id: 5,
    title: "Toyota Hilux 2023 Full Extras",
    price: "$24,000",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: { text: "Dealer", color: "blue" } as const
  },
  {
    id: 6,
    title: "Apartamento en el centro de la ciudad",
    price: "$150,000",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: { text: "Inmobiliaria", color: "blue" } as const
  }
];

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex justify-between items-end mb-4 px-4">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <a href="#" className="text-[#0058ab] font-semibold text-sm">Ver más</a>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <Navbar />

      <main className="flex-1 space-y-8 py-6">
        
        {/* Recommended Section */}
        <section>
          <SectionHeader title="Recomendados para tí" />
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
            {recommendedItems.map((item) => (
              <ServiceCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        {/* Separator */}
        <div className="h-2 bg-gray-100" />

        {/* Featured Section */}
        <section className="pt-6">
          <SectionHeader title="Publicaciones Destacadas" />
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
            {featuredItems.map((item) => (
              <ServiceCard key={item.id} {...item} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Index;