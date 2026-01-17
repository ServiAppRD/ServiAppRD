import { useState, useMemo } from "react";
import { Search as SearchIcon, MapPin, Filter, Star, X, Clock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Mock Data for Real Logic ---
const CATEGORIES = [
  "Todos", "Plomería", "Electricidad", "Limpieza", "Mecánica", 
  "Carpintería", "Jardinería", "Tecnología", "Belleza"
];

const MOCK_SERVICES = [
  {
    id: 1,
    title: "Servicio de Plomería Express",
    category: "Plomería",
    rating: 4.8,
    reviews: 124,
    price: "$350/hr",
    distance: "2.5 km",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Reparación de fugas, instalación de grifos y mantenimiento general. Disponibilidad inmediata."
  },
  {
    id: 2,
    title: "Limpieza Profunda de Hogar",
    category: "Limpieza",
    rating: 4.9,
    reviews: 89,
    price: "$500/visita",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1581578731117-104f2a417954?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Servicio completo de limpieza. Incluye cocina, baños y aspirado de alfombras."
  },
  {
    id: 3,
    title: "Electricista Certificado",
    category: "Electricidad",
    rating: 4.7,
    reviews: 56,
    price: "$400/hr",
    distance: "5.0 km",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Instalaciones eléctricas, reparación de cortos y mantenimiento preventivo."
  },
  {
    id: 4,
    title: "Mecánica Automotriz a Domicilio",
    category: "Mecánica",
    rating: 4.5,
    reviews: 34,
    price: "Cotizar",
    distance: "8.5 km",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Diagnóstico por computadora, cambio de batería y servicios menores en tu ubicación."
  },
  {
    id: 5,
    title: "Jardinería y Paisajismo",
    category: "Jardinería",
    rating: 5.0,
    reviews: 12,
    price: "$300/hr",
    distance: "3.0 km",
    image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Poda de césped, diseño de jardines y mantenimiento de áreas verdes."
  }
];

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isFocused, setIsFocused] = useState(false);

  // --- Filtering Logic ---
  const filteredServices = useMemo(() => {
    return MOCK_SERVICES.filter((service) => {
      const matchesSearch = 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        activeCategory === "Todos" || service.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const hasActiveFilters = searchTerm !== "" || activeCategory !== "Todos";

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-safe animate-fade-in">
      
      {/* Sticky Header */}
      <div className="bg-white sticky top-0 z-20 shadow-sm rounded-b-[1.5rem] pb-4 px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4 text-[#0F172A] px-1">Explorar Servicios</h1>
        
        {/* Search Bar */}
        <div className="flex gap-3 items-center">
          <div className={cn(
            "relative flex-1 transition-all duration-300 transform",
            isFocused ? "scale-[1.02]" : "scale-100"
          )}>
            <SearchIcon className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
              isFocused ? "text-[#F97316]" : "text-gray-400"
            )} />
            <Input 
              placeholder="¿Qué necesitas arreglar hoy?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="pl-12 h-12 text-base rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F97316] focus:ring-[#F97316]/20 transition-all shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-gray-200 hover:border-[#F97316] hover:text-[#F97316] hover:bg-orange-50 transition-colors shadow-sm bg-white">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1 px-1 -mx-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border",
                activeCategory === cat
                  ? "bg-[#F97316] border-[#F97316] text-white shadow-md shadow-orange-200 scale-105"
                  : "bg-white border-gray-100 text-gray-500 hover:border-[#F97316] hover:text-[#F97316]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Results Count or Popular Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-gray-800 text-lg">
            {hasActiveFilters ? (
              <span>Resultados <span className="text-gray-400 text-sm font-normal">({filteredServices.length})</span></span>
            ) : (
              "Tendencias esta semana"
            )}
          </h2>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div 
                key={service.id} 
                className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer group flex gap-4"
              >
                {/* Image */}
                <div className="h-28 w-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                   <img src={service.image} alt={service.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                      <span className="text-[10px] font-bold text-gray-800">{service.rating}</span>
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1 py-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="secondary" className="bg-orange-50 text-[#F97316] hover:bg-orange-100 border-0 text-[10px] px-2 h-5">
                        {service.category}
                      </Badge>
                      <span className="text-[#F97316] font-bold text-sm whitespace-nowrap">{service.price}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#F97316] transition-colors truncate">
                      {service.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                    <div className="flex items-center text-xs text-gray-400 font-medium">
                      <MapPin className="h-3 w-3 mr-1" />
                      {service.distance}
                    </div>
                    <div className="flex items-center text-xs text-[#F97316] font-semibold group-hover:translate-x-1 transition-transform">
                      Ver detalles <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <SearchIcon className="h-8 w-8 text-[#F97316] opacity-50" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">No encontramos resultados</h3>
              <p className="text-gray-500 text-sm max-w-[200px]">
                Intenta buscar con otras palabras o cambia la categoría seleccionada.
              </p>
              <Button 
                variant="link" 
                className="text-[#F97316] mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("Todos");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Popular Tags (Only show if not searching deeply) */}
        {!hasActiveFilters && (
          <section className="pt-2">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Búsquedas populares</h3>
            <div className="flex flex-wrap gap-2">
              {["Instalación aire", "Limpieza hogar", "Fuga de agua", "Mecánico cerca"].map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  onClick={() => setSearchTerm(tag)}
                  className="px-4 py-2 text-xs font-normal bg-white border-gray-200 text-gray-600 hover:border-[#F97316] hover:text-[#F97316] cursor-pointer transition-all rounded-xl"
                >
                  <Clock className="h-3 w-3 mr-1.5 text-gray-400" />
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default SearchPage;