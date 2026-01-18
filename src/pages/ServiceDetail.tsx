import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, MapPin, Share2, Heart, Check, Phone, ShieldCheck, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            phone,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Servicio no encontrado</h2>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  // Formatear fecha
  const formattedDate = new Date(service.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white pb-24 animate-fade-in">
      {/* Header Image */}
      <div className="relative h-72 w-full bg-gray-100">
        <img 
          src={service.image_url || "/placeholder.svg"} 
          alt={service.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Navbar Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent pt-safe">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-5 -mt-6 relative z-10 bg-white rounded-t-3xl pt-6 space-y-6">
        
        {/* Title & Price Section */}
        <div>
          <div className="flex justify-between items-start gap-4 mb-2">
            <Badge className="bg-orange-50 text-[#F97316] hover:bg-orange-100 border-0">
              {service.category}
            </Badge>
            <div className="text-right">
              <span className="block text-2xl font-bold text-[#F97316]">
                ${service.price}
              </span>
              {service.price_unit && (
                <span className="text-xs text-gray-400 font-medium">/{service.price_unit}</span>
              )}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
            {service.title}
          </h1>
          
          <div className="flex flex-wrap gap-y-2 gap-x-4">
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
              {service.location || "Ubicación no especificada"}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
              Publicado el {formattedDate}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full" />

        {/* Author Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-gray-100">
            <AvatarImage src={service.profiles?.avatar_url} />
            <AvatarFallback className="bg-orange-100 text-[#F97316] font-bold">
              {service.profiles?.first_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400">Publicado por</p>
            <h3 className="font-bold text-gray-900">
              {service.profiles?.first_name} {service.profiles?.last_name}
            </h3>
          </div>
          <Button size="icon" className="rounded-full bg-green-50 text-green-600 hover:bg-green-100 h-10 w-10 shadow-sm">
            <Phone className="h-5 w-5" />
          </Button>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 text-lg">Descripción</h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            {service.description || "Sin descripción detallada."}
          </p>
        </div>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">Incluye</h3>
            <div className="grid grid-cols-1 gap-2">
              {service.features.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="bg-white p-1 rounded-full text-[#F97316] shadow-sm mt-0.5">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe z-20">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-gray-200">
            Mensaje
          </Button>
          <Button className="flex-[2] bg-[#F97316] hover:bg-orange-600 text-white h-12 rounded-xl font-bold shadow-lg shadow-orange-200">
            Contratar Ahora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;