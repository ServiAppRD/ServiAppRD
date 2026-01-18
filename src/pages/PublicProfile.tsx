import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Phone, Star, ArrowLeft, MessageCircle } from "lucide-react";
import { ServiceCard } from "@/components/ServiceCard";
import { showError } from "@/utils/toast";

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ rating: 0, count: 0 });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);

        // 2. Fetch User Services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false });
        
        setServices(servicesData || []);

        // 3. Fetch Reviews & Calculate Stats
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

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#F97316] h-8 w-8" /></div>;
  if (!profile) return <div className="h-screen flex items-center justify-center">Usuario no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header Background */}
      <div className="bg-[#0F172A] h-48 relative rounded-b-[2rem]">
         <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 left-4 text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
         >
            <ArrowLeft className="h-6 w-6" />
         </Button>
      </div>

      <div className="px-5 -mt-16 pb-20">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative">
           <div className="absolute -top-12 p-2 bg-white rounded-full">
             <Avatar className="h-24 w-24 border-2 border-gray-100">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl">{profile.first_name?.[0]}</AvatarFallback>
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

           <div className="mt-6 w-full grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full rounded-xl" onClick={handleWhatsApp}>
                 <MessageCircle className="mr-2 h-4 w-4" /> Chat
              </Button>
              <Button className="w-full rounded-xl bg-[#F97316] hover:bg-orange-600" onClick={handleWhatsApp}>
                 Contratar
              </Button>
           </div>
        </div>

        {/* Services Section */}
        <div className="mt-8">
           <h2 className="text-lg font-bold mb-4 text-gray-900">Servicios Publicados ({services.length})</h2>
           {services.length > 0 ? (
             <div className="grid grid-cols-2 gap-4">
               {services.map((service) => (
                 <div key={service.id} onClick={() => navigate(`/service/${service.id}`)}>
                    <ServiceCard 
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
      </div>
    </div>
  );
};

export default PublicProfile;