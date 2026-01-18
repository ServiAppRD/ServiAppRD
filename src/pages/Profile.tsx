import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { 
  Loader2, LogOut, User, Phone, MapPin, Heart, 
  HelpCircle, ChevronRight, Star, 
  ArrowLeft, Bell, Settings, Edit2, Briefcase, Trash2, Camera, Gift, Zap, Clock, Hourglass
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceCard } from "@/components/ServiceCard";

const DR_CITIES = [
  "Santo Domingo", "Santiago de los Caballeros", "San Francisco de Macorís", 
  "Higüey", "La Romana", "San Cristóbal", "San Pedro de Macorís", 
  "La Vega", "Puerto Plata", "Barahona", "Punta Cana", "Bávaro"
];

const REWARD_TARGET_SECONDS = 5 * 60 * 60; // 5 Horas

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'edit' | 'preview' | 'my-services' | 'reputation' | 'favorites' | 'rewards'>('dashboard');
  const [session, setSession] = useState<any>(null);
  
  // Profile Data
  const [profileData, setProfileData] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState(""); 
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Rewards & Other Data
  const [userStats, setUserStats] = useState<any>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [myFavorites, setMyFavorites] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      } else {
        getProfile(session.user.id);
        fetchUserStats(session.user.id);
        
        const viewParam = searchParams.get('view');
        if (viewParam === 'favorites') {
          handleOpenFavorites(session.user.id);
        }
      }
    });
  }, [navigate, searchParams]);

  useEffect(() => {
    let interval: any;
    if (session?.user?.id && view === 'rewards') {
        interval = setInterval(() => {
            fetchUserStats(session.user.id);
        }, 10000);
    }
    return () => clearInterval(interval);
  }, [session, view]);

  const calculateCompletion = (data: any) => {
    const fields = [
      { key: 'first_name' }, { key: 'last_name' }, { key: 'phone' }, { key: 'city' }
    ];
    const completed = fields.filter(f => data[f.key] && String(data[f.key]).trim() !== '').length;
    setTotalSteps(fields.length);
    setCompletedSteps(completed);
  };

  const getProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, city, address, avatar_url')
        .eq('id', userId)
        .single();

      if (data) {
        setProfileData(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setAddress(data.address || "");
        setAvatarUrl(data.avatar_url || "");
        calculateCompletion(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId: string) => {
    const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle();
    if (!data && !error) {
      await supabase.from('user_stats').insert({ user_id: userId, boosts: 0, active_seconds: 0 });
    } else if (data) {
      setUserStats(data);
      setActiveSeconds(data.active_seconds || 0);
      setCanClaim((data.active_seconds || 0) >= REWARD_TARGET_SECONDS);
    }
  };

  const handleClaimReward = async () => {
    if (!canClaim) return;
    setClaiming(true);
    try {
      const { error } = await supabase.rpc('claim_reward_boost');
      if (error) throw error;
      showSuccess("¡Felicidades! Has ganado 1 Boost.");
      fetchUserStats(session.user.id);
      setCanClaim(false);
    } catch (error: any) {
      showError(error.message || "Error al reclamar recompensa");
    } finally {
      setClaiming(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      
      // Auto-guardar la URL en el perfil
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', session.user.id);
      showSuccess("Foto actualizada");

    } catch (error: any) {
      showError(error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const updateProfile = async () => {
    try {
      setUpdating(true);
      const updates = {
        id: session?.user.id,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        city: city,
        address: address,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      showSuccess("Perfil actualizado");
      setProfileData(updates);
      calculateCompletion(updates);
      setView('preview');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };
  const getProgressPercentage = () => Math.min((activeSeconds / REWARD_TARGET_SECONDS) * 100, 100);
  const getRemainingTime = () => {
      const remaining = Math.max(0, REWARD_TARGET_SECONDS - activeSeconds);
      return remaining === 0 ? "¡Listo!" : formatTime(remaining);
  };

  const fetchMyServices = async () => {
    const { data } = await supabase.from('services').select('*').eq('user_id', session.user.id).order('created_at', {ascending: false});
    setMyServices(data || []);
  };
  const fetchFavorites = async (uid?: string) => {
    const { data } = await supabase.from('favorites').select(`service_id, services:service_id(*)`).eq('user_id', uid || session.user.id);
    setMyFavorites(data?.map((i:any) => i.services).filter(Boolean) || []);
  };
  const fetchReputation = async () => {
    const { data } = await supabase.from('reviews').select('*').eq('reviewee_id', session.user.id);
    setReviews(data || []);
    setAverageRating(data && data.length > 0 ? data.reduce((a:any,b:any)=>a+b.rating,0)/data.length : 0);
  };
  const handleDeleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    setMyServices(prev => prev.filter(s => s.id !== id));
    showSuccess("Eliminado");
  };
  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/"); };
  const handleOpenMyServices = () => { setView('my-services'); fetchMyServices(); };
  const handleOpenFavorites = (uid?: string) => { setView('favorites'); fetchFavorites(uid); };
  const handleOpenReputation = () => { setView('reputation'); fetchReputation(); };
  const handleBackToDashboard = () => { if(searchParams.get('view')) navigate('/profile', {replace:true}); setView('dashboard'); };

  // Componente de Avatar Reutilizable
  const ProfileAvatar = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl", className?: string }) => {
    const sizeClasses = {
      sm: "h-8 w-8 text-xs",
      md: "h-12 w-12 text-lg",
      lg: "h-24 w-24 text-3xl",
      xl: "h-28 w-28 text-4xl"
    };
    
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarImage src={avatarUrl || profileData?.avatar_url} className="object-cover" />
        <AvatarFallback className="bg-gray-200 text-gray-500 font-bold">
          {firstName ? firstName[0].toUpperCase() : <User className="h-1/2 w-1/2" />}
        </AvatarFallback>
      </Avatar>
    );
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#F97316]" /></div>;

  // --- VIEWS ---

  if (view === 'rewards') {
    return (
      <div className="min-h-screen bg-white pb-20 pt-safe animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#F97316] rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-400 rounded-full blur-[80px] animate-pulse delay-1000" />
        </div>
        <div className="relative z-10">
          <div className="p-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-gray-500 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-bold text-gray-900">Mis Recompensas</h1>
            <div className="w-10" />
          </div>
          <div className="flex flex-col items-center justify-center mt-4 space-y-6 px-6">
             <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-4 bg-orange-50 rounded-full border border-orange-100 mb-2 shadow-sm">
                  <Zap className="h-10 w-10 text-[#F97316] fill-[#F97316]" />
                </div>
                <h2 className="text-4xl font-black tracking-tight text-gray-900">{userStats?.boosts || 0}</h2>
                <p className="text-gray-500 font-medium">Boosts Disponibles</p>
                <Button variant="link" className="text-[#F97316] text-xs h-auto p-0 hover:text-orange-700" onClick={() => navigate('/publish')}>Usar en nueva publicación</Button>
             </div>
             <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-xl text-center space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-center gap-2 text-[#F97316]">
                  <Hourglass className={`h-5 w-5 ${!canClaim ? "animate-spin-slow" : ""}`} />
                  <span className="font-bold tracking-widest text-sm uppercase">Tiempo Activo</span>
                </div>
                <div className="space-y-2">
                    <div className="font-mono text-4xl font-bold tracking-wider text-gray-900 tabular-nums">
                      {formatTime(activeSeconds)} <span className="text-base text-gray-400 font-normal">/ 5h</span>
                    </div>
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 relative">
                       <div className="h-full bg-gradient-to-r from-[#F97316] to-yellow-500 transition-all duration-1000 ease-out relative" style={{ width: `${getProgressPercentage()}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">{canClaim ? "¡Meta alcanzada!" : `Faltan ${getRemainingTime()} de uso`}</p>
                </div>
                <Button onClick={handleClaimReward} disabled={!canClaim || claiming} className={`w-full h-12 rounded-xl text-lg font-bold transition-all transform ${canClaim ? "bg-[#F97316] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/40 scale-105 animate-pulse" : "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-200"}`}>
                  {claiming ? <Loader2 className="animate-spin" /> : canClaim ? "¡Reclamar Boost!" : "Sigue usándola..."}
                </Button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'favorites') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBackToDashboard}><ArrowLeft className="h-6 w-6" /></Button>
            <h1 className="text-lg font-bold">Mis Favoritos</h1>
          </div>
        </div>
        <div className="p-4">
          {myFavorites.length === 0 ? <div className="text-center py-10 text-gray-500">Sin favoritos</div> : (
            <div className="grid grid-cols-2 gap-4">
              {myFavorites.map((s) => <div key={s.id} onClick={()=>navigate(`/service/${s.id}`)}><ServiceCard title={s.title} price={`RD$ ${s.price}`} image={s.image_url} /></div>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'reputation') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
           <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Reputación</h1></div>
        </div>
        <div className="p-4 text-center">
            <div className="text-4xl font-bold mb-2 flex justify-center items-center gap-2"><Star className="h-8 w-8 text-[#F97316] fill-current"/>{averageRating.toFixed(1)}</div>
            <div className="space-y-4 text-left mt-6">
                {reviews.map(r => <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border"><p>"{r.comment}"</p></div>)}
            </div>
        </div>
      </div>
    )
  }

  if (view === 'my-services') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
           <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Mis Publicaciones</h1></div>
           <Button size="sm" variant="outline" onClick={()=>navigate('/publish')}>+ Nueva</Button>
        </div>
        <div className="p-4 space-y-4">
           {myServices.map(s => (
             <div key={s.id} className="bg-white p-3 rounded-xl shadow-sm flex gap-3">
               <img src={s.image_url} className="h-16 w-16 rounded object-cover" />
               <div className="flex-1">
                 <h3 className="font-bold truncate">{s.title}</h3>
                 <p className="text-orange-500 text-sm font-bold">RD$ {s.price}</p>
                 <div className="flex gap-2 mt-2">
                   <Button size="sm" variant="outline" className="h-7 text-xs" onClick={()=>navigate(`/service/${s.id}`)}>Ver</Button>
                   <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={()=>handleDeleteService(s.id)}><Trash2 className="h-3 w-3"/></Button>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    )
  }

  if (view === 'preview') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe relative">
        <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-br from-[#F97316] to-orange-600 rounded-b-[3rem] z-0 shadow-lg" />
        <div className="relative z-10 px-4 pt-4">
          <div className="flex justify-between items-center text-white mb-2">
            <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-white hover:bg-white/20"><ArrowLeft className="h-6 w-6" /></Button>
            <h1 className="text-lg font-bold">Mi Perfil</h1>
            <Button variant="ghost" size="icon" onClick={() => setView('edit')} className="text-white hover:bg-white/20"><Edit2 className="h-5 w-5" /></Button>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center mt-24 space-y-4 border border-gray-100">
            <div className="relative -mt-20 mb-4 flex justify-center">
               <div className="p-2 bg-white rounded-full shadow-sm">
                  <ProfileAvatar size="xl" className="border-4 border-orange-50" />
               </div>
            </div>
            <div><h2 className="text-2xl font-bold">{firstName} {lastName}</h2><p className="text-gray-500 text-sm">{session?.user.email}</p></div>
            <div className="grid grid-cols-1 gap-4 pt-4 text-left border-t border-gray-50">
               <div className="flex gap-3"><Phone className="text-orange-500 h-4 w-4"/><span>{phone || "No agregado"}</span></div>
               <div className="flex gap-3"><MapPin className="text-orange-500 h-4 w-4"/><span>{city || "No agregado"}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6"/></Button>
          <h1 className="text-lg font-bold">Editar Perfil</h1>
        </div>
        
        <div className="p-6 max-w-md mx-auto space-y-6">
            
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center gap-3">
               <div className="relative group cursor-pointer">
                 <ProfileAvatar size="xl" />
                 <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-[#F97316] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-orange-600 transition-colors">
                    {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                 </label>
                 <input 
                   id="avatar-upload" 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   onChange={uploadAvatar}
                   disabled={uploadingAvatar}
                 />
               </div>
               <p className="text-xs text-gray-500">Toca el icono de cámara para cambiar tu foto</p>
            </div>

            <div className="space-y-4">
              <div><Label>Nombre</Label><Input value={firstName} onChange={e=>setFirstName(e.target.value)}/></div>
              <div><Label>Apellido</Label><Input value={lastName} onChange={e=>setLastName(e.target.value)}/></div>
              <div><Label>Teléfono</Label><Input value={phone} onChange={e=>setPhone(e.target.value)} type="tel"/></div>
              <div>
                <Label>Ciudad</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue placeholder="Selecciona tu ciudad"/></SelectTrigger>
                  <SelectContent className="bg-white">{DR_CITIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={updateProfile} className="w-full bg-[#F97316] h-12 text-lg">{updating ? <Loader2 className="animate-spin"/> : "Guardar Cambios"}</Button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-safe animate-fade-in">
      <div className="bg-white pt-4 pb-4 px-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-b-[2.5rem] relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <p className="text-gray-400 text-sm font-medium">Bienvenido,</p>
            <h1 className="text-2xl font-bold text-[#0F172A] truncate">{firstName || 'Usuario'}</h1>
          </div>
          <div onClick={() => setView('preview')} className="cursor-pointer">
             <ProfileAvatar size="md" className="border-2 border-orange-100" />
          </div>
        </div>
        <div className="flex justify-between gap-2 pb-2">
          <QuickAction icon={User} label="Perfil" onClick={() => setView('preview')} />
          <QuickAction icon={Star} label="Reputación" onClick={handleOpenReputation} />
          <QuickAction icon={MapPin} label="Ubicación" onClick={() => setView('edit')} />
          <QuickAction icon={HelpCircle} label="Ayuda" />
        </div>
      </div>

      <div className="px-5 space-y-6 mt-6">
        {completedSteps < totalSteps && (
           <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
             <div className="mb-2"><h3 className="font-bold">Completa tu perfil</h3><p className="text-sm text-gray-500">{completedSteps}/{totalSteps} pasos</p></div>
             <Progress value={(completedSteps/totalSteps)*100} className="h-2 mb-3" />
             <Button onClick={()=>setView('edit')} className="w-full bg-[#F97316] h-9 text-sm">Terminar</Button>
           </div>
        )}

        <div className="space-y-6">
          <MenuSection title="Mis Servicios">
            <MenuItem icon={Briefcase} label="Mis Publicaciones" onClick={handleOpenMyServices} />
            <MenuItem icon={Heart} label="Mis Favoritos" badge={myFavorites.length > 0 ? String(myFavorites.length) : undefined} onClick={() => handleOpenFavorites()} />
          </MenuSection>

          <MenuSection title="Recompensas & Cuenta">
            <MenuItem icon={Gift} label="Recompensas" badge={canClaim ? "!" : undefined} onClick={() => setView('rewards')} />
            <MenuItem icon={Bell} label="Notificaciones" />
          </MenuSection>

          <MenuSection title="Preferencias">
            <MenuItem icon={Settings} label="Configuración" onClick={() => setView('edit')} />
            <MenuItem icon={LogOut} label="Cerrar Sesión" onClick={handleSignOut} isDestructive />
          </MenuSection>
        </div>
      </div>
    </div>
  );
};

const MenuSection = ({ title, children }: any) => (<div><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">{title}</h3><div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">{children}</div></div>);
const QuickAction = ({ icon: Icon, label, onClick }: any) => (<button onClick={onClick} className="flex flex-col items-center gap-2 group flex-1"><div className="w-14 h-14 bg-orange-50/80 group-hover:bg-[#F97316] rounded-2xl flex items-center justify-center transition-all shadow-sm border border-orange-100/50"><Icon className="h-6 w-6 text-[#F97316] group-hover:text-white transition-colors" strokeWidth={2} /></div><span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#F97316]">{label}</span></button>);
const MenuItem = ({ icon: Icon, label, onClick, isDestructive, badge }: any) => (<button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-orange-50/30 transition-colors group relative"><div className="flex items-center gap-4"><div className={`p-2 rounded-xl ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-orange-50/50 text-[#F97316]'} transition-all`}><Icon className="h-5 w-5" strokeWidth={2} /></div><span className={`font-semibold text-sm ${isDestructive ? 'text-red-500' : 'text-gray-700'}`}>{label}</span></div><div className="flex items-center gap-3">{badge && (<span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${badge === "!" ? "bg-red-500 animate-pulse" : "bg-[#F97316]"}`}>{badge}</span>)}<ChevronRight className="h-4 w-4 text-gray-300" /></div></button>);

export default Profile;