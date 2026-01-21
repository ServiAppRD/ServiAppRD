import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Star, ArrowLeft, MessageCircle, MoreVertical, Ban, ShieldCheck, Share2 } from "lucide-react";
import { ServiceCard } from "@/components/ServiceCard";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ rating: 0, count: 0 });
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        // 1. Check if blocked
        if (session) {
           const { data: blockData } = await supabase.from('blocked_users')
             .select('id')
             .eq('blocker_id', session.user.id)
             .eq('blocked_user_id', id)
             .maybeSingle();
           if (blockData) setIsBlocked(true);
        }

        // 2. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);

        // 3. Fetch User Services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', id)
          .is('deleted_at', null) // Filtrar borrados
          .order('created_at', { ascending: false });
        
        setServices(servicesData || []);

        // 4. Fetch Reviews & Calculate Stats
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewee_id', id);

        if (reviewsData && reviewsData.length > 0) {
           setReviews(reviewsData);
           const avg = reviewsData.reduce((acc, curr) => acc + curr.rating, 0) / reviewsData.length;
           setStats({ rating: avg, count: reviewsData.length });
        }

      } catch (error: any) {
        console.error(error);
        showError("No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleWhatsApp = () => {
    if (profile?.phone) {
      let cleanPhone = profile.phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '1' + cleanPhone;
      const url = `https://wa.me/${cleanPhone}`;
      window.open(url, '_blank');
    } else {
      showError("Este usuario no tiene teléfono registrado");
    }
  };

  const handleBlockUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showError("Inicia sesión para bloquear");
        navigate("/login");
        return;
      }

      if (isBlocked) {
        // Unblock
        const { error } = await supabase.from('blocked_users')
          .delete()
          .eq('blocker_id', session.user.id)
          .eq('blocked_user_id', id);
        
        if (error) throw error;
        setIsBlocked(false);
        showSuccess("Usuario desbloqueado");
      } else {
        // Block
        const { error } = await supabase.from('blocked_users')
          .insert({ blocker_id: session.user.id, blocked_user_id: id });
        
        if (error) throw error;
        setIsBlocked(true);
        showSuccess("Usuario bloqueado. No verás sus publicaciones.");
        // Opcional: Volver atrás después de bloquear
        navigate(-1);
      }
      setIsMenuOpen(false);
    } catch (error: any) {
      console.error(error);
      showError("Error al actualizar bloqueo");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#F97316] h-8 w-8" /></div>;
  if (!profile) return <div className="h-screen flex items-center justify-center">Usuario no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      
      {/* MENU DRAWER */}
      <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DrawerContent className="rounded-t-[2rem]">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mt-4 mb-2" />
          <DrawerHeader className="text-left pb-0">
            <DrawerTitle className="text-xl font-bold text-gray-900">Opciones de usuario</DrawerTitle>
            <DrawerDescription>Gestiona tu interacción con este perfil.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-3">
             <Button 
                variant="outline" 
                className={cn(
                    "w-full justify-start h-16 text-lg font-bold rounded-2xl border-2 transition-all",
                    isBlocked 
                        ? "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                        : "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                )}
                onClick={handleBlockUser}
             >
                <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mr-4 shadow-sm border",
                    isBlocked ? "bg-gray-100 border-gray-200" : "bg-white border-red-100"
                )}>
                    {isBlocked ? <ShieldCheck className="h-5 w-5 text-gray-600" /> : <Ban className="h-5 w-5 text-red-500" />}
                </div>
                {isBlocked ? "Desbloquear usuario" : "Bloquear usuario"}
             </Button>

             <Button 
                variant="outline"
                className="w-full justify-start h-14 text-base font-medium rounded-xl border-gray-100 bg-white hover:bg-gray-50 text-gray-700"
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showSuccess("Enlace de perfil copiado");
                    setIsMenuOpen(false);
                }}
             >
                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 shadow-sm border border-gray-100">
                    <Share2 className="h-5 w-5 text-gray-500" />
                </div>
                Copiar enlace del perfil
             </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" className="rounded-xl h-12 text-gray-500 font-medium">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Header Background */}
      <div 
        className="h-48 rounded-b-[2rem] transition-colors duration-500"
        style={{ backgroundColor: profile.profile_color || '#0F172A' }}
      >
         <div className="pt-6 px-4 flex justify-between items-start">
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="h-6 w-6" />
            </Button>

            <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10"
                onClick={() => setIsMenuOpen(true)}
            >
                <MoreVertical className="h-6 w-6" />
            </Button>
         </div>
      </div>

      <div className="px-5 -mt-16 pb-20">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative">
           <div className="absolute -top-12 p-2 bg-white rounded-full">
             <Avatar className="h-24 w-24 border-2 border-gray-100">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl font-bold bg-gray-100 text-gray-500">
                    {profile.first_name?.[0]?.toUpperCase()}
                </AvatarFallback>
             </Avatar>
           </div>
           
           <div className="mt-14 space-y-1">
             <h1 className="text-2xl font-bold text-gray-900">{profile.first_name} {profile.last_name}</h1>
             
             {/* Rating Badge */}
             <div className="flex items-center justify-center gap-1 bg-orange-50 w-fit mx-auto px-3 py-1 rounded-full text-sm font-medium text-[#F97316]">
                <Star className="h-4 w-4 fill-current" />
                <span>{stats.rating.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">({stats.count} reseñas)</span>
             </div>
           </div>

           <div className="flex flex-wrap justify-center gap-4 mt-4 w-full border-t border-gray-50 pt-4">
              {profile.city && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                   <MapPin className="h-4 w-4 text-gray-400" /> {profile.city}
                </div>
              )}
           </div>

           {isBlocked ? (
             <div className="mt-6 w-full p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                Has bloqueado a este usuario.
             </div>
           ) : (
             <div className="mt-6 w-full grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full rounded-xl" onClick={handleWhatsApp}>
                   <MessageCircle className="mr-2 h-4 w-4" /> Chat
                </Button>
                <Button className="w-full rounded-xl bg-[#F97316] hover:bg-orange-600" onClick={handleWhatsApp}>
                   Contratar
                </Button>
             </div>
           )}
        </div>

        {/* Services Section - Hidden if blocked */}
        {!isBlocked && (
          <div className="mt-8">
             <h2 className="text-lg font-bold mb-4 text-gray-900">Servicios Publicados ({services.length})</h2>
             {services.length > 0 ? (
               <div className="grid grid-cols-2 gap-4">
                 {services.map((service) => (
                   <div key={service.id} onClick={() => navigate(`/service/${service.id}`)}>
                      <ServiceCard 
                         id={service.id}
                         title={service.title} 
                         price={`RD$ ${service.price}`} 
                         image={service.image_url} 
                      />
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed">
                 Este usuario aún no tiene servicios activos.
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;