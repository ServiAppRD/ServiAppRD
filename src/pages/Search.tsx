import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, MapPin, Star, X, ArrowRight, Loader2, AlertCircle, Wrench, ChevronRight, ChevronLeft, Check, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PullToRefresh } from "@/components/PullToRefresh";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Todos", "Plomería", "Electricidad", "Limpieza", "Mecánica", 
  "Carpintería", "Jardinería", "Tecnología", "Belleza", "Otros"
];

const DR_LOCATIONS: Record<string, string[]> = {
  "Distrito Nacional": [
    "Piantini", "Naco", "Gascue", "Ciudad Colonial", "Bella Vista", "Evaristo Morales", 
    "Los Cacicazgos", "Mirador Sur", "Mirador Norte", "Ensanche Quisqueya", "Paraíso", 
    "Los Prados", "El Millón", "Zona Universitaria", "La Julia", "Serrallés", "Arroyo Hondo"
  ],
  "Santo Domingo Este": [
    "Alma Rosa I", "Alma Rosa II", "Ensanche Ozama", "Los Mina", "Villa Duarte", 
    "Invivienda", "San Isidro", "Corales del Sur", "Hainamosa", "Villa Faro"
  ],
  "Santo Domingo Norte": [
    "Villa Mella", "Sabana Perdida", "Guaricanos", "Ciudad Modelo", "Jacobl Majesty"
  ],
  "Santo Domingo Oeste": [
    "Herrera", "Las Caobas", "Manoguayabo", "Los Alcarrizos", "Bayona"
  ],
  "Santiago": [
    "Santiago Centro", "Los Jardines", "Villa Olga", "La Trinitaria", "Gurabo", 
    "Hoya del Caimito", "Cienfuegos", "Pekín", "Nibaje"
  ],
  "La Altagracia": [
    "Punta Cana", "Bávaro", "Higüey", "Cap Cana", "Verón", "Bayahíbe"
  ],
  "La Romana": [
    "La Romana Centro", "Casa de Campo", "Buena Vista", "Villa Hermosa"
  ],
  "San Cristóbal": [
    "San Cristóbal Centro", "Madre Vieja", "Haina", "Nigua", "Yaguate"
  ],
  "Puerto Plata": [
    "Puerto Plata Centro", "Sosúa", "Cabarete", "Playa Dorada", "Torre Alta"
  ],
  "San Pedro de Macorís": [
    "San Pedro Centro", "Juan Dolio", "Guayacanes", "Consuelo"
  ],
  "La Vega": [
    "La Vega Centro", "Jarabacoa", "Constanza"
  ]
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Inicializar estado basado en URL params
  const initialSearch = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "Todos";
  const initialProvince = searchParams.get("province") || "";
  const initialSector = searchParams.get("sector") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  
  // Location Filter State
  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isFocused, setIsFocused] = useState(false);

  // Actualizar URL y guardar preferencia para recomendaciones
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (activeCategory && activeCategory !== "Todos") {
      params.set("category", activeCategory);
      localStorage.setItem("lastSearchCategory", activeCategory);
    }
    if (selectedProvince) params.set("province", selectedProvince);
    if (selectedSector) params.set("sector", selectedSector);
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, activeCategory, selectedProvince, selectedSector, setSearchParams]);

  // Fetch services from Supabase
  const { data: services, isLoading, error, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      // 1. Obtener lista de bloqueados
      const { data: { session } } = await supabase.auth.getSession();
      let blockedIds: string[] = [];
      
      if (session) {
          const { data: blocked } = await supabase.from('blocked_users').select('blocked_user_id').eq('blocker_id', session.user.id);
          if (blocked) blockedIds = blocked.map(b => b.blocked_user_id);
      }

      // 2. Fetch servicios
      let query = supabase
        .from('services')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            is_plus
          )
        `)
        .is('deleted_at', null);

      // Filtrar bloqueados si existen
      if (blockedIds.length > 0) {
        query = query.not('user_id', 'in', `(${blockedIds.join(',')})`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

  const handleRefresh = async () => {
    await refetch();
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // Client-side filtering & SORTING (Priority Logic)
  const filteredServices = services?.filter((service) => {
    const matchesSearch = 
      (service.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (service.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      activeCategory === "Todos" || service.category === activeCategory;

    // Location Logic
    let matchesLocation = true;
    if (selectedProvince) {
      matchesLocation = service.location === selectedProvince;
      if (matchesLocation && selectedSector) {
        const areas = Array.isArray(service.service_areas) ? service.service_areas : [];
        if (areas.length > 0) {
           matchesLocation = areas.includes(selectedSector);
        }
      }
    }

    return matchesSearch && matchesCategory && matchesLocation;
  }).sort((a, b) => {
      // 1. Prioridad: Servicio Promocionado (Boost Individual)
      const aPromoted = a.is_promoted && a.promoted_until && new Date(a.promoted_until) > new Date();
      const bPromoted = b.is_promoted && b.promoted_until && new Date(b.promoted_until) > new Date();
      if (aPromoted && !bPromoted) return -1;
      if (!aPromoted && bPromoted) return 1;

      // 2. Prioridad: Usuario Plus
      const aPlus = a.profiles?.is_plus || false;
      const bPlus = b.profiles?.is_plus || false;
      if (aPlus && !bPlus) return -1;
      if (!aPlus && bPlus) return 1;

      // 3. Fallback: Fecha de creación (más reciente primero)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) || [];

  const hasActiveFilters = searchTerm !== "" || activeCategory !== "Todos" || selectedProvince !== "";

  const clearLocationFilters = () => {
    setSelectedProvince("");
    setSelectedSector("");
    setIsFilterOpen(false);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
        
        {/* Sticky Header with Safe Area */}
        <div className="bg-white sticky top-0 z-20 shadow-sm rounded-b-[1.5rem] pt-safe">
          <div className="pb-4 px-4 pt-4">
            <div className="flex justify-between items-center mb-4 px-1">
               <h1 className="text-2xl font-bold text-[#0F172A]">Explorar Servicios</h1>
               
               {/* Location Filter Button */}
               <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                 <DrawerTrigger asChild>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className={cn(
                       "rounded-full px-3 h-8 border text-xs font-medium gap-1.5 transition-all",
                       selectedProvince ? "bg-orange-50 border-orange-200 text-[#F97316]" : "bg-white border-gray-200 text-gray-600"
                     )}
                   >
                     <MapPin className="h-3.5 w-3.5" />
                     {selectedProvince ? (selectedSector || selectedProvince) : "Ubicación"}
                   </Button>
                 </DrawerTrigger>
                 <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[2rem]">
                   <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mt-4 mb-2" />
                   <DrawerHeader className="text-left flex-shrink-0 pb-2">
                     <DrawerTitle className="text-xl font-bold text-gray-900">
                         {selectedProvince ? "Selecciona Sector" : "Selecciona Ubicación"}
                     </DrawerTitle>
                     <DrawerDescription>
                        {selectedProvince 
                          ? `Estás buscando en ${selectedProvince}` 
                          : "Elige primero la provincia donde buscas el servicio."}
                     </DrawerDescription>
                   </DrawerHeader>

                   <div className="flex-1 overflow-y-auto px-4 min-h-[300px]">
                        {!selectedProvince ? (
                            <div className="space-y-2 pb-4">
                                {Object.keys(DR_LOCATIONS).map((prov) => (
                                    <button
                                        key={prov}
                                        onClick={() => {
                                            setSelectedProvince(prov);
                                            setSelectedSector("");
                                        }}
                                        className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-100 bg-white hover:border-[#F97316] hover:bg-orange-50 transition-all font-medium text-gray-700 flex justify-between items-center active:scale-[0.98]"
                                    >
                                        {prov}
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4 animate-in slide-in-from-right-4 duration-300">
                                <button 
                                    onClick={() => { setSelectedProvince(""); setSelectedSector(""); }}
                                    className="flex items-center text-sm text-gray-500 hover:text-[#F97316] mb-2 font-medium"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Cambiar Provincia
                                </button>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedSector("")}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-xl border transition-all font-medium flex justify-between items-center active:scale-[0.98]",
                                            selectedSector === "" 
                                                ? "bg-[#F97316] border-[#F97316] text-white shadow-md shadow-orange-200" 
                                                : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        Toda la provincia
                                        {selectedSector === "" && <Check className="h-4 w-4 text-white" />}
                                    </button>
                                    
                                    {DR_LOCATIONS[selectedProvince]?.map((sector) => (
                                        <button
                                            key={sector}
                                            onClick={() => setSelectedSector(sector === selectedSector ? "" : sector)}
                                            className={cn(
                                                "w-full text-left px-4 py-3 rounded-xl border transition-all font-medium flex justify-between items-center active:scale-[0.98]",
                                                selectedSector === sector
                                                    ? "bg-[#F97316] border-[#F97316] text-white shadow-md shadow-orange-200" 
                                                    : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
                                            )}
                                        >
                                            {sector}
                                            {selectedSector === sector && <Check className="h-4 w-4 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                   </div>

                   <div className="p-4 border-t border-gray-100 bg-white pb-safe mt-auto">
                        <div className="flex gap-3">
                             <Button variant="outline" className="flex-1 h-12 rounded-xl border-gray-200" onClick={clearLocationFilters}>
                                Limpiar
                             </Button>
                             <Button 
                                className="flex-[2] h-12 rounded-xl bg-[#F97316] hover:bg-orange-600 font-bold text-white shadow-lg shadow-orange-100" 
                                onClick={() => setIsFilterOpen(false)}
                             >
                                Ver Resultados
                             </Button>
                        </div>
                   </div>
                 </DrawerContent>
               </Drawer>
            </div>
            
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
            </div>

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
        </div>

        <div className="p-5 space-y-6">

          {/* Banner Promocional (Solo visible si no hay busqueda activa para no estorbar) */}
          {!hasActiveFilters && (
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg flex items-center justify-between">
              <div className="relative z-10 max-w-lg">
                <h3 className="text-xl font-bold mb-2">¡Ofrece tus servicios gratis!</h3>
                <p className="text-gray-300 text-xs mb-4 max-w-[90%]">Llega a miles de clientes potenciales.</p>
                <Button onClick={() => navigate('/publish')} size="sm" className="bg-[#F97316] text-white hover:bg-orange-600 font-bold border-0 shadow-lg hover:shadow-orange-500/20 transition-all">Publicar Servicio</Button>
              </div>
              <div className="absolute -right-4 -bottom-6 opacity-20 transform rotate-[-15deg]">
                <Wrench className="w-32 h-32 text-[#F97316]" />
              </div>
            </div>
          )}

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

          {error && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">No pudimos cargar los servicios. Intenta recargar.</p>
            </div>
          )}

          <div className="space-y-4">
            {!isLoading && filteredServices.length > 0 ? (
              filteredServices.map((service) => {
                const isPromoted = service.is_promoted && service.promoted_until && new Date(service.promoted_until) > new Date();
                const isPlus = service.profiles?.is_plus;
                
                return (
                  <div 
                    key={service.id} 
                    onClick={() => navigate(`/service/${service.id}`)}
                    className={cn(
                        "bg-white p-3 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group flex gap-4",
                        isPromoted 
                            ? "border-orange-200 shadow-orange-100/50" 
                            : isPlus 
                            ? "border-blue-100" 
                            : "border-gray-100 hover:border-orange-100"
                    )}
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
                       
                       {/* Priority Badges in Image */}
                       {isPromoted ? (
                         <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm z-10">
                            <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                            <span className="text-[10px] font-bold text-gray-800">Top</span>
                         </div>
                       ) : isPlus ? (
                         <div className="absolute top-2 left-2 bg-[#0239c7] px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm z-10">
                            <Crown className="h-3 w-3 fill-white text-white" />
                            <span className="text-[10px] font-bold text-white">PLUS</span>
                         </div>
                       ) : null}
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <Badge variant="secondary" className="bg-orange-50 text-[#F97316] hover:bg-orange-100 border-0 text-[10px] px-2 h-5 truncate max-w-[50%]">
                            {service.category}
                          </Badge>
                          <span className="text-[#F97316] font-bold text-sm whitespace-nowrap">
                            RD$ {service.price} <span className="text-[10px] text-gray-400 font-normal">/{service.price_unit || 'servicio'}</span>
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
                );
              })
            ) : !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-[#F97316] opacity-50" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 px-6">
                  No encontramos resultados aquí
                </h3>
                <p className="text-gray-500 text-sm max-w-[220px] mb-6">
                  Intenta cambiar la ubicación o la categoría.
                </p>
                {hasActiveFilters ? (
                  <div className="flex flex-col gap-3 w-full max-w-[200px]">
                      <Button 
                        className="bg-[#F97316] hover:bg-orange-600 text-white rounded-xl w-full"
                        onClick={() => {
                          setSearchTerm("");
                          setActiveCategory("Todos");
                          setSelectedProvince("");
                          setSelectedSector("");
                        }}
                      >
                        Ver todos los servicios
                      </Button>
                  </div>
                ) : (
                  <Button 
                    className="bg-[#F97316] hover:bg-orange-600 text-white rounded-xl"
                    onClick={() => navigate('/publish')}
                  >
                    Publicar en esta zona
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default SearchPage;