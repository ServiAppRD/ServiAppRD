import { Search as SearchIcon, MapPin, Filter, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { name: "Plomería", count: 120 },
    { name: "Electricidad", count: 85 },
    { name: "Limpieza", count: 200 },
    { name: "Mecánica", count: 50 },
    { name: "Carpintería", count: 45 },
    { name: "Jardinería", count: 60 },
    { name: "Tecnología", count: 90 },
    { name: "Belleza", count: 150 },
  ];

  const popularSearches = [
    "Instalación de aire acondicionado",
    "Limpieza de hogar",
    "Reparación de fugas",
    "Mantenimiento de auto"
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Search Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm p-4">
        <h1 className="text-2xl font-bold mb-4 text-[#0F172A]">Buscar</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="¿Qué estás buscando?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base rounded-xl border-gray-200 focus-visible:ring-[#F97316] bg-gray-50"
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-gray-200">
            <Filter className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Recent/Popular Searches */}
        {!searchTerm && (
          <section>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Búsquedas populares</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-3 py-1.5 text-sm font-normal bg-white border border-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#F97316] hover:border-orange-100 cursor-pointer transition-colors"
                >
                  {term}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categorías</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, index) => (
              <div 
                key={index}
                className="bg-white p-4 rounded-xl border border-gray-100 hover:border-[#F97316] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="font-semibold text-gray-800 group-hover:text-[#F97316]">{cat.name}</div>
                <div className="text-xs text-gray-400 mt-1">{cat.count} profesionales</div>
              </div>
            ))}
          </div>
        </section>

        {/* Example Results (Only show if typing) */}
        {searchTerm && (
          <section>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Resultados</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex gap-3">
                  <div className="h-20 w-20 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 truncate">Servicio Profesional {i}</h4>
                      <div className="flex items-center text-xs font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        4.8
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      Descripción breve del servicio que ofrece este profesional...
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      A 2.5 km de ti
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchPage;