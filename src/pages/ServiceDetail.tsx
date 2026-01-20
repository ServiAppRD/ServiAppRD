import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ArrowLeft, MapPin, Check, Phone, Calendar, Star, MessageCircle, Send, Facebook, Instagram, Globe, AlertCircle, Flag, MoreVertical, Share2, ShieldAlert, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { showSuccess, showError } from "@/utils/toast";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const REPORT_REASONS = [
  { id: "inappropriate", label: "Contenido inapropiado", icon: "🔞" },
  { id: "scam", label: "Estafa o fraude", icon: "🚫" },
  { id: "illegal", label: "Servicio ilegal", icon: "👮" },
  { id: "fake", label: "Información falsa", icon: "🤥" },
  { id: "spam", label: "Es Spam", icon: "📢" },
  { id: "other", label: "Otro motivo", icon: "📝" }
];

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  
  // Drawer States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Report State
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);

  const viewTracked = useRef(false);

  // --- TRACKING ---
  const trackEvent = async (type: 'view' | 'click') => {
    if (!service) return;
    await supabase.from('service_analytics').insert({
      service_id: id,
      owner_id: service.user_id,
      event_type: type
    });
    if (type === 'view') await supabase.rpc('increment_view', { row_id: id });
    else await supabase.rpc('increment_click', { row_id: id });
  };

  const incrementCounterManual = async (field: 'views' | 'clicks') => {
      const { data } = await supabase.from('services').select(field).eq('id', id).single();
      if (data) await supabase.from('services').update({ [field]: (data as any)[field] + 1 }).eq('id', id);
  };

  // --- QUERIES ---
  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`*, profiles (id, first_name, last_name, phone, avatar_url)`)
        .eq('id', id)
        .is('deleted_at', null)
        .single();
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (service && !viewTracked.current) {
        viewTracked.current = true;
        setTimeout(() => { trackEvent('view').catch(() => incrementCounterManual('views')); }, 2000);
    }
  }, [service]);

  const { data: reviews, isLoading: isLoadingReviews, refetch: refetchReviews, isError: isErrorReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('reviews').select(`*, reviewer:profiles!reviewer_id (first_name, last_name, avatar_url)`).eq('service_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // --- ACTIONS ---
  const handleCall = () => {
    trackEvent('click').catch(() => incrementCounterManual('clicks'));
    if (service?.profiles?.phone) window.location.href = `tel:${service.profiles.phone}`;
    else showError("Este usuario no tiene un teléfono público registrado.");
  };

  const handleWhatsApp = () => {
    trackEvent('click').catch(() => incrementCounterManual('clicks'));
    if (service?.profiles?.phone) {
      let cleanPhone = service.profiles.phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '1' + cleanPhone;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${service.profiles.first_name}, vi tu servicio "${service.title}" en ServiAPP.`)}`, '_blank');
    } else showError("Este usuario no tiene un teléfono registrado para WhatsApp.");
  };

  const openSocial = (url: string) => {
    if (!url) return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.title,
          text: `Mira este servicio en ServiAPP: ${service.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess("Enlace copiado al portapapeles");
    }
    setIsMenuOpen(false);
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) return showError("Por favor selecciona una calificación");
    setSubmitting(true);
    try {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) { showError("Debes iniciar sesión para opinar"); navigate("/login"); return; }
       if (session.user.id === service.user_id) { showError("No puedes opinar sobre tu propio servicio"); return; }
       const { error } = await supabase.from('reviews').insert({
         reviewer_id: session.user.id, reviewee_id: service.user_id, service_id: id, rating: newRating, comment: newComment
       });
       if (error) throw error;
       await refetchReviews();
       showSuccess("¡Gracias por tu opinión!");
       setIsReviewOpen(false); setNewRating(0); setNewComment("");
    } catch (error: any) { showError(error.message); } finally { setSubmitting(false); }
  };

  const handleReport = async () => {
    if (!reportReason) return showError("Selecciona una razón");
    setReporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { showError("Inicia sesión para reportar"); navigate("/login"); return; }
      const { error } = await supabase.from('reports').insert({
        reporter_id: session.user.id, reported_service_id: id, reason: reportReason, details: reportDetails
      });
      if (error) throw error;
      showSuccess("Reporte enviado. Revisaremos el caso.");
      setIsReportOpen(false); setReportReason(""); setReportDetails("");
    } catch (error: any) { console.error(error); showError("Error al enviar reporte"); } finally { setReporting(false); }
  };

  if (isLoadingService) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-[#F97316]" /></div>;

  if (!service) return <div className="min-h-screen flex flex-col items-center justify-center p-4"><h2 className="text-xl font-bold mb-2">Servicio no disponible</h2><Button onClick={() => navigate(-1)}>Volver</Button></div>;

  const formattedDate = new Date(service.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const social = service.social_media as { facebook?: string; instagram?: string; website?: string } | null;
  const serviceAreas = Array.isArray(service.service_areas) ? service.service_areas : [];

  return (
    <div className="min-h-screen bg-white pb-32 animate-fade-in">
      
      {/* 1. MENU DRAWER (Compartir / Reportar) */}
      <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DrawerContent className="rounded-t-[2rem]">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mt-4 mb-2" />
          <DrawerHeader className="text-left pb-0">
            <DrawerTitle className="text-xl font-bold text-gray-900">Opciones de publicación</DrawerTitle>
            <DrawerDescription>¿Qué deseas hacer?</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-3">
             <Button 
                variant="outline" 
                className="w-full justify-start h-14 text-base font-medium rounded-xl border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-900"
                onClick={handleShare}
             >
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm border border-gray-100">
                    <Share2 className="h-5 w-5 text-blue-600" />
                </div>
                Compartir publicación
             </Button>

             <Button 
                variant="outline" 
                className="w-full justify-start h-14 text-base font-medium rounded-xl border-red-100 bg-red-50 hover:bg-red-100 text-red-600"
                onClick={() => { setIsMenuOpen(false); setTimeout(() => setIsReportOpen(true), 200); }}
             >
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm border border-red-100">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                </div>
                Reportar problema
             </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" className="rounded-xl h-12 text-gray-500">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 2. REPORT DRAWER (Formulario Grande) */}
      <Drawer open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DrawerContent className="rounded-t-[2rem] max-h-[90vh]">
           <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mt-4 mb-2" />
           <ScrollArea className="overflow-y-auto">
             <DrawerHeader className="text-left">
               <DrawerTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <Flag className="h-6 w-6" /> Reportar Publicación
               </DrawerTitle>
               <DrawerDescription className="text-base">
                 Selecciona el motivo principal del reporte.
               </DrawerDescription>
             </DrawerHeader>
             
             <div className="p-4 pt-0 space-y-4">
                <div className="grid gap-3">
                   {REPORT_REASONS.map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => setReportReason(reason.label)}
                        className={cn(
                           "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left",
                           reportReason === reason.label 
                             ? "border-red-500 bg-red-50" 
                             : "border-gray-100 bg-white hover:border-gray-200"
                        )}
                      >
                         <div className="flex items-center gap-3">
                            <span className="text-2xl">{reason.icon}</span>
                            <span className={cn("font-semibold text-base", reportReason === reason.label ? "text-red-700" : "text-gray-700")}>
                               {reason.label}
                            </span>
                         </div>
                         {reportReason === reason.label && <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center"><Check className="h-3 w-3 text-white" strokeWidth={3} /></div>}
                      </button>
                   ))}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Detalles adicionales (Opcional)</label>
                  <Textarea 
                    placeholder="Describe brevemente el problema para ayudarnos a entender..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="min-h-[100px] text-base rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <Button 
                   className="w-full h-14 text-lg font-bold rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                   onClick={handleReport}
                   disabled={reporting || !reportReason}
                >
                   {reporting ? <Loader2 className="animate-spin mr-2" /> : "Enviar Reporte"}
                </Button>
                <DrawerClose asChild>
                    <Button variant="ghost" className="w-full h-12 rounded-xl text-gray-500">Cancelar</Button>
                </DrawerClose>
             </div>
           </ScrollArea>
        </DrawerContent>
      </Drawer>

      {/* Header Image */}
      <div className="relative w-full bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-50 blur-xl scale-110" style={{ backgroundImage: `url(${service.image_url || "/placeholder.svg"})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <img src={service.image_url || "/placeholder.svg"} alt={service.title} className="relative z-10 w-full h-auto max-h-[60vh] object-contain" />
        {/* Safe Area Wrapper for Buttons */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-safe">
            <div className="p-4 flex justify-between items-start">
              <Button size="icon" variant="ghost" className="rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40" onClick={() => navigate(-1)}><ArrowLeft className="h-6 w-6" /></Button>
              
              <Button 
                 size="icon" 
                 variant="ghost" 
                 className="rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40"
                 onClick={() => setIsMenuOpen(true)}
              >
                <MoreVertical className="h-6 w-6" />
              </Button>
            </div>
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
            <div className="flex items-center text-gray-500 font-medium"><MapPin className="h-4 w-4 mr-1 text-gray-400" />{service.location}</div>
            <div className="flex items-center text-gray-500"><Calendar className="h-4 w-4 mr-1 text-gray-400" />{formattedDate}</div>
          </div>
        </div>
        <div className="h-px bg-gray-100 w-full" />
        {/* Áreas de Servicio */}
        {serviceAreas.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
             <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2"><MapPin className="h-4 w-4 text-[#F97316]" /> Cobertura en {service.location}</h3>
             <div className="flex flex-wrap gap-2">{serviceAreas.map((area: string, i: number) => (<span key={i} className="bg-white border border-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-md shadow-sm font-medium">{area}</span>))}</div>
          </div>
        )}
        {/* Perfil Clicable */}
        <div className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => navigate(`/user/${service.user_id}`)}>
          <Avatar className="h-14 w-14 border border-gray-100"><AvatarImage src={service.profiles?.avatar_url} /><AvatarFallback className="bg-orange-100 text-[#F97316] font-bold">{service.profiles?.first_name?.[0] || 'U'}</AvatarFallback></Avatar>
          <div className="flex-1"><p className="text-xs font-medium text-gray-400 uppercase">Publicado por</p><h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-[#F97316] transition-colors">{service.profiles?.first_name} {service.profiles?.last_name}</h3><div className="mt-1 flex items-center gap-1"><Star className="h-4 w-4 text-[#F97316] fill-current" /><span className="font-bold text-gray-900">{averageRating}</span><span className="text-gray-400 text-xs">({reviews?.length || 0} reseñas)</span></div></div>
          <Button size="icon" variant="ghost" className="text-gray-400 group-hover:translate-x-1 transition-all"><ChevronRight className="h-6 w-6" /></Button>
        </div>
        {/* Descripción */}
        <div className="space-y-3"><h3 className="font-bold text-gray-900 text-lg">Descripción</h3><p className="text-gray-600 leading-relaxed text-sm">{service.description || "Sin descripción detallada."}</p></div>
        {/* Features */}
        {service.features && service.features.length > 0 && (<div className="space-y-3"><h3 className="font-bold text-gray-900 text-lg">Incluye</h3><div className="grid grid-cols-1 gap-2">{service.features.map((feature: string, idx: number) => (<div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"><div className="bg-white p-1 rounded-full text-[#F97316] shadow-sm mt-0.5"><Check className="h-3 w-3" strokeWidth={3} /></div><span className="text-sm text-gray-700 font-medium">{feature}</span></div>))}</div></div>)}
        {/* Redes Sociales */}
        {social && (social.facebook || social.instagram || social.website) && (<div className="space-y-3"><h3 className="font-bold text-gray-900 text-lg">Enlaces Externos</h3><div className="flex gap-3">{social.facebook && (<Button variant="outline" className="flex-1 gap-2 border-blue-100 text-blue-600 hover:bg-blue-50" onClick={() => openSocial(social.facebook!)}><Facebook className="h-4 w-4" /> Facebook</Button>)}{social.instagram && (<Button variant="outline" className="flex-1 gap-2 border-pink-100 text-pink-600 hover:bg-pink-50" onClick={() => openSocial(social.instagram!)}><Instagram className="h-4 w-4" /> Instagram</Button>)}{social.website && (<Button variant="outline" className="flex-1 gap-2 border-gray-200 text-gray-600 hover:bg-gray-50" onClick={() => openSocial(social.website!)}><Globe className="h-4 w-4" /> Web</Button>)}</div></div>)}
        <div className="h-px bg-gray-100 w-full my-4" />
        {/* REVIEWS SECTION */}
        <div className="space-y-4">
           <div className="flex justify-between items-center"><h3 className="font-bold text-gray-900 text-lg">Reseñas</h3><Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}><DialogTrigger asChild><Button variant="outline" size="sm" className="text-[#F97316] border-orange-200 hover:bg-orange-50">Escribir opinión</Button></DialogTrigger><DialogContent className="sm:max-w-md rounded-2xl"><DialogHeader><DialogTitle>Califica este servicio</DialogTitle></DialogHeader><div className="flex flex-col items-center space-y-4 py-4"><div className="flex gap-2">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={cn("h-8 w-8 cursor-pointer transition-all hover:scale-110", star <= newRating ? "fill-[#F97316] text-[#F97316]" : "text-gray-300")} onClick={() => setNewRating(star)} />))}</div><Textarea placeholder="Cuéntanos tu experiencia..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[100px]" /><Button onClick={handleSubmitReview} disabled={submitting} className="w-full bg-[#F97316] hover:bg-orange-600">{submitting ? <Loader2 className="animate-spin" /> : "Publicar Reseña"}</Button></div></DialogContent></Dialog></div>
           {isLoadingReviews ? (<Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-300" />) : isErrorReviews ? (<div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600 text-sm"><AlertCircle className="h-5 w-5" />Error cargando reseñas. Intenta refrescar.</div>) : reviews && reviews.length > 0 ? (<div className="space-y-4">{reviews.map((review: any) => (<div key={review.id} className="bg-gray-50 p-4 rounded-xl space-y-2"><div className="flex justify-between items-start"><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={review.reviewer?.avatar_url} /><AvatarFallback>{review.reviewer?.first_name?.[0] || 'A'}</AvatarFallback></Avatar><span className="font-bold text-sm text-gray-900">{review.reviewer?.first_name || "Anónimo"}</span></div><div className="flex text-[#F97316]">{[...Array(5)].map((_, i) => (<Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-gray-300 fill-none")} />))}</div></div><p className="text-gray-600 text-sm">{review.comment}</p><p className="text-[10px] text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p></div>))}</div>) : (<div className="text-center py-8 text-gray-400 border border-dashed rounded-xl">Sé el primero en opinar sobre este servicio.</div>)}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe z-20"><div className="max-w-lg mx-auto flex gap-3"><Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-gray-200 text-gray-700 hover:bg-gray-50" onClick={handleCall}><Phone className="mr-2 h-5 w-5" /> Llamar</Button><Button className="flex-[2] bg-[#25D366] hover:bg-[#20bd5a] text-white h-12 rounded-xl font-bold shadow-lg shadow-green-100" onClick={handleWhatsApp}><MessageCircle className="mr-2 h-5 w-5" /> WhatsApp</Button></div></div>
    </div>
  );
};

export default ServiceDetail;