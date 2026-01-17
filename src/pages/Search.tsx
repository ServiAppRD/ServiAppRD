import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, MapPin, Filter, Star, X, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PullToRefresh } from "@/components/PullToRefresh";

const CATEGORIES = [
  "Todos", "Plomería", "Electricidad", "Limpieza", "Mecánica", 
  "Carpintería", "Jardinería", "Tecnología", "Belleza", "Otros"
];

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isFocused, setIsFocused] = useState(false);

  // Fetch services from Supabase
  const { data: services, isLoading, error, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log("Fetching services...");
      // Obtenemos los servicios y la información básica del perfil del creador
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching services:", error);
        throw error;
      }
      return data;
    }
  });

  const handleRefresh = async () => {
    // Aquí podemos simplemente hacer refetch de los datos en lugar de recargar toda la página
    // pero si prefieres el efecto de "reinicio" completo, usamos window.location.reload()
    await refetch();
    await new Promise(resolve => setTimeout(resolve, 500)); // Un pequeño delay visual
  };

  // Client-side filtering
  const filteredServices = services?.filter((service) => {
    const matchesSearch = 
      (service.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (service.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      activeCategory === "Todos" || service.category === activeCategory;

    return matchesSearch && matchesCategory;
  }) || [];

  const hasActiveFilters = searchTerm !== "" || activeCategory !== "Todos";

  return (
    <PullToRefresh onRefresh={handleRefresh}>
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
          
          {/* Results Count or Header */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-lg">
              {isLoading ? (
                <span className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                </span>
              ) : hasActiveFilters ? (
                <span>Resultados <span className="text-gray-400 text-sm font-normal">({filteredServices.length})</span></span>
              ) : (
                "Nuevos Servicios"
              )}
            </h2>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">No pudimos cargar los servicios. Intenta recargar.</p>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-4">
            {!isLoading && filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer group flex gap-4"
                >
                  {/* Image */}
                  <div className="h-28 w-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                    {service.image_url ? (
                      <img src={service.image_url} alt={service.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full bg-orange-50 flex items-center justify-center">
                        <SearchIcon className="h-8 w-8 text-orange-200" />
                      </div>
                    )}
                     <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                        <span className="text-[10px] font-bold text-gray-800">New</span>
                     </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <Badge variant="secondary" className="bg-orange-50 text-[#F97316] hover:bg-orange-100 border-0 text-[10px] px-2 h-5 truncate max-w-[50%]">
                          {service.category}
                        </Badge>
                        <span className="text-[#F97316] font-bold text-sm whitespace-nowrap">
                          ${service.price} <span className="text-[10px] text-gray-400 font-normal">/{service.price_unit || 'servicio'}</span>
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#F97316] transition-colors truncate">
                        {service.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {service.description || "Sin descripción disponible."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                      <div className="flex items-center text-xs text-gray-400 font-medium truncate max-w-[60%]">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        {service.location || "Ubicación remota"}
                      </div>
                      <div className="flex items-center text-xs text-[#F97316] font-semibold group-hover:translate-x-1 transition-transform whitespace-nowrap">
                        Ver detalles <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : !isLoading ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                  <SearchIcon className="h-8 w-8 text-[#F97316] opacity-50" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {hasActiveFilters ? "No encontramos resultados" : "Aún no hay servicios"}
                </h3>
                <p className="text-gray-500 text-sm max-w-[200px] mb-4">
                  {hasActiveFilters 
                    ? "Intenta buscar con otras palabras o cambia la categoría seleccionada." 
                    : "Sé el primero en publicar un servicio en esta categoría."}
                </p>
                {hasActiveFilters ? (
                  <Button 
                    variant="link" 
                    className="text-[#F97316]"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveCategory("Todos");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                ) : (
                  <Button 
                    className="bg-[#F97316] hover:bg-orange-600 text-white rounded-xl"
                    onClick={() => window.location.href = '/publish'} // Simple redirect for now
                  >
                    Publicar Servicio
                  </Button>
                )}
              </div>
            ) : null}
          </div>

          {/* Popular Tags (Only show if not searching deeply) */}
          {!hasActiveFilters && !isLoading && filteredServices.length === 0 && (
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
    </PullToRefresh>
  );
};

export default SearchPage;