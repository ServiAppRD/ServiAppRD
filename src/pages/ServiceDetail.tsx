import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, MapPin, Check, Phone, Calendar, Star, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { showSuccess, showError } from "@/utils/toast";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- QUERIES ---

  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles (
            id,
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

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id (
             first_name,
             last_name,
             avatar_url
          )
        `)
        .eq('service_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate Average Rating
  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // --- ACTIONS ---

  const handleCall = () => {
    if (service?.profiles?.phone) {
      window.location.href = `tel:${service.profiles.phone}`;
    } else {
      showError("Este usuario no tiene un teléfono público registrado.");
    }
  };

  const handleWhatsApp = () => {
    if (service?.profiles?.phone) {
      let cleanPhone = service.profiles.phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '1' + cleanPhone;
      const message = `Hola ${service.profiles.first_name}, vi tu servicio "${service.title}" en ServiAPP.`;
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      showError("Este usuario no tiene un teléfono registrado para WhatsApp.");
    }
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) return showError("Por favor selecciona una calificación");
    setSubmitting(true);
    
    try {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) {
         showError("Debes iniciar sesión para opinar");
         navigate("/login");
         return;
       }

       if (session.user.id === service.user_id) {
         showError("No puedes opinar sobre tu propio servicio");
         return;
       }

       const { error } = await supabase.from('reviews').insert({
         reviewer_id: session.user.id,
         reviewee_id: service.user_id,
         service_id: id,
         rating: newRating,
         comment: newComment
       });

       if (error) throw error;

       showSuccess("¡Gracias por tu opinión!");
       setIsReviewOpen(false);
       setNewRating(0);
       setNewComment("");
       queryClient.invalidateQueries({ queryKey: ['reviews', id] });

    } catch (error: any) {
       showError(error.message);
    } finally {
       setSubmitting(false);
    }
  };

  if (isLoadingService) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-[#F97316]" /></div>;
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Servicio no encontrado</h2>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  const formattedDate = new Date(service.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white pb-32 animate-fade-in">
      {/* Header Image */}
      <div className="relative w-full bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-50 blur-xl scale-110" style={{ backgroundImage: `url(${service.image_url || "/placeholder.svg"})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <img src={service.image_url || "/placeholder.svg"} alt={service.title} className="relative z-10 w-full h-auto max-h-[60vh] object-contain" />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 pt-safe">
          <Button size="icon" variant="ghost" className="rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40" onClick={() => navigate(-1)}><ArrowLeft className="h-6 w-6" /></Button>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 bg-white rounded-t-3xl pt-6 space-y-6">
        
        {/* Info Principal */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-[#F97316]">RD$ {service.price}</span>
            {service.price_unit && <span className="text-sm text-gray-400 font-medium">/{service.price_unit}</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">{service.title}</h1>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-sm">
             <Badge className="bg-orange-50 text-[#F97316] hover:bg-orange-100 border-0">{service.category}</Badge>
            <div className="flex items-center text-gray-500"><MapPin className="h-4 w-4 mr-1 text-gray-400" />{service.location || "Ubicación no especificada"}</div>
            <div className="flex items-center text-gray-500"><Calendar className="h-4 w-4 mr-1 text-gray-400" />{formattedDate}</div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full" />

        {/* Perfil Clicable */}
        <div 
          className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
          onClick={() => navigate(`/user/${service.user_id}`)}
        >
          <Avatar className="h-14 w-14 border border-gray-100">
            <AvatarImage src={service.profiles?.avatar_url} />
            <AvatarFallback className="bg-orange-100 text-[#F97316] font-bold">{service.profiles?.first_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-400 uppercase">Publicado por</p>
            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-[#F97316] transition-colors">
              {service.profiles?.first_name} {service.profiles?.last_name}
            </h3>
            <div className="mt-1 flex items-center gap-1">
                 <Star className="h-4 w-4 text-[#F97316] fill-current" />
                 <span className="font-bold text-gray-900">{averageRating}</span>
                 <span className="text-gray-400 text-xs">({reviews?.length || 0} reseñas)</span>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="text-gray-400 group-hover:translate-x-1 transition-all"><ArrowLeft className="h-5 w-5 rotate-180" /></Button>
        </div>

        {/* Descripción */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 text-lg">Descripción</h3>
          <p className="text-gray-600 leading-relaxed text-sm">{service.description || "Sin descripción detallada."}</p>
        </div>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">Incluye</h3>
            <div className="grid grid-cols-1 gap-2">
              {service.features.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="bg-white p-1 rounded-full text-[#F97316] shadow-sm mt-0.5"><Check className="h-3 w-3" strokeWidth={3} /></div>
                  <span className="text-sm text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-px bg-gray-100 w-full my-4" />

        {/* REVIEWS SECTION */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">Reseñas</h3>
              <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogTrigger asChild>
                   <Button variant="outline" size="sm" className="text-[#F97316] border-orange-200 hover:bg-orange-50">Escribir opinión</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl">
                   <DialogHeader>
                     <DialogTitle>Califica este servicio</DialogTitle>
                   </DialogHeader>
                   <div className="flex flex-col items-center space-y-4 py-4">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                             key={star}
                             className={cn("h-8 w-8 cursor-pointer transition-all hover:scale-110", star <= newRating ? "fill-[#F97316] text-[#F97316]" : "text-gray-300")}
                             onClick={() => setNewRating(star)}
                          />
                        ))}
                      </div>
                      <Textarea 
                         placeholder="Cuéntanos tu experiencia..." 
                         value={newComment}
                         onChange={(e) => setNewComment(e.target.value)}
                         className="min-h-[100px]"
                      />
                      <Button onClick={handleSubmitReview} disabled={submitting} className="w-full bg-[#F97316] hover:bg-orange-600">
                         {submitting ? <Loader2 className="animate-spin" /> : "Publicar Reseña"}
                      </Button>
                   </div>
                </DialogContent>
              </Dialog>
           </div>

           {/* Review List */}
           {isLoadingReviews ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-300" />
           ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                 {reviews.map((review: any) => (
                    <div key={review.id} className="bg-gray-50 p-4 rounded-xl space-y-2">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={review.reviewer?.avatar_url} />
                                <AvatarFallback>{review.reviewer?.first_name?.[0] || 'A'}</AvatarFallback>
                             </Avatar>
                             <span className="font-bold text-sm text-gray-900">{review.reviewer?.first_name || "Anónimo"}</span>
                          </div>
                          <div className="flex text-[#F97316]">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-gray-300 fill-none")} />
                             ))}
                          </div>
                       </div>
                       <p className="text-gray-600 text-sm">{review.comment}</p>
                       <p className="text-[10px] text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="text-center py-8 text-gray-400 border border-dashed rounded-xl">
                 Sé el primero en opinar sobre este servicio.
              </div>
           )}
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe z-20">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-gray-200 text-gray-700 hover:bg-gray-50" onClick={handleCall}>
            <Phone className="mr-2 h-5 w-5" /> Llamar
          </Button>
          <Button className="flex-[2] bg-[#25D366] hover:bg-[#20bd5a] text-white h-12 rounded-xl font-bold shadow-lg shadow-green-100" onClick={handleWhatsApp}>
            <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;