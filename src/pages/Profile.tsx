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
  ArrowLeft, Settings, Edit2, Briefcase, Trash2, Camera, Gift, Zap, Check,
  Clock, TrendingUp, Crown, BarChart3, ShieldCheck, Eye, MousePointerClick, CalendarRange,
  UploadCloud, AlertTriangle, FileCheck, Hammer, Lock, Shield, MoreHorizontal
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceCard } from "@/components/ServiceCard";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const DR_CITIES = [
  "Santo Domingo", "Santiago de los Caballeros", "San Francisco de Macorís", 
  "Higüey", "La Romana", "San Cristóbal", "San Pedro de Macorís", 
  "La Vega", "Puerto Plata", "Barahona", "Punta Cana", "Bávaro"
];

const PROFILE_COLORS = [
  { name: "Medianoche", value: "#0F172A" }, 
  { name: "Naranja", value: "#F97316" }, 
  { name: "Azul Real", value: "#3B82F6" },   
  { name: "Indigo", value: "#6366F1" },  
  { name: "Violeta", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },    
  { name: "Rojo", value: "#EF4444" },   
  { name: "Esmeralda", value: "#10B981" },    
  { name: "Turquesa", value: "#06B6D4" },
];

const REWARD_TARGET_SECONDS = 5 * 60 * 60; // 5 Horas

const BOOST_OPTIONS = [
  { label: "1 Día", duration: 24, price: 299, popular: false },
  { label: "3 Días", duration: 72, price: 499, popular: true },
  { label: "7 Días", duration: 168, price: 999, popular: false },
];

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'edit' | 'preview' | 'my-services' | 'reputation' | 'favorites' | 'rewards' | 'metrics' | 'verification' | 'account-settings' | 'change-password'>('dashboard');
  const [session, setSession] = useState<any>(null);
  
  // Profile Data
  const [profileData, setProfileData] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState(""); 
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileColor, setProfileColor] = useState("#0F172A");
  
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

  // Metrics Data Real
  const [metricsTimeRange, setMetricsTimeRange] = useState('7d');
  const [metricsData, setMetricsData] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Verification State (Placeholder removed logic)
  const [verifying, setVerifying] = useState(false);

  // Boost Logic
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedServiceToBoost, setSelectedServiceToBoost] = useState<any>(null);
  const [selectedBoostOption, setSelectedBoostOption] = useState<number | null>(null);
  const [processingBoost, setProcessingBoost] = useState(false);

  // Account Settings Logic
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete Service Logic with Boost Protection
  const [showBoostDeleteWarning, setShowBoostDeleteWarning] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [deleteTimer, setDeleteTimer] = useState(5);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      } else {
        getProfile(session.user.id);
        fetchUserStats(session.user.id);
        fetchMyServices(session.user.id);
        
        const viewParam = searchParams.get('view');
        if (viewParam === 'favorites') handleOpenFavorites(session.user.id);
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

  useEffect(() => {
    if (view === 'metrics' && session?.user?.id) {
        fetchRealMetrics();
    }
  }, [view, metricsTimeRange, session]);

  // Timer for Boost Delete Warning
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showBoostDeleteWarning && deleteTimer > 0) {
      timer = setTimeout(() => setDeleteTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showBoostDeleteWarning, deleteTimer]);


  const fetchRealMetrics = async () => {
    setLoadingMetrics(true);
    try {
        const now = new Date();
        let startDate = new Date();

        if (metricsTimeRange === '24h') startDate.setHours(now.getHours() - 24);
        else if (metricsTimeRange === '7d') startDate.setDate(now.getDate() - 7);
        else if (metricsTimeRange === '30d') startDate.setDate(now.getDate() - 30);
        else if (metricsTimeRange === '1y') startDate.setFullYear(now.getFullYear() - 1);
        else startDate = new Date(0); 

        const { data: events, error } = await supabase
            .from('service_analytics')
            .select('event_type, created_at')
            .eq('owner_id', session.user.id)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        const viewsCount = events?.filter(e => e.event_type === 'view').length || 0;
        const clicksCount = events?.filter(e => e.event_type === 'click').length || 0;
        setTotalViews(viewsCount);
        setTotalClicks(clicksCount);

        const groupedData = new Map();
        const points = metricsTimeRange === '24h' ? 24 : metricsTimeRange === '7d' ? 7 : metricsTimeRange === '30d' ? 30 : 12;
        
        for (let i = 0; i < points; i++) {
            let key = "";
            let dateRef = new Date();
            
            if (metricsTimeRange === '24h') {
                dateRef.setHours(now.getHours() - (points - 1 - i));
                key = `${dateRef.getHours()}:00`;
            } else if (metricsTimeRange === '7d' || metricsTimeRange === '30d') {
                dateRef.setDate(now.getDate() - (points - 1 - i));
                key = `${dateRef.getDate()}/${dateRef.getMonth() + 1}`;
            } else { 
                dateRef.setMonth(now.getMonth() - (points - 1 - i));
                key = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][dateRef.getMonth()];
            }
            groupedData.set(key, { name: key, views: 0, clicks: 0 });
        }

        events?.forEach(e => {
            const date = new Date(e.created_at);
            let key = "";
            
            if (metricsTimeRange === '24h') key = `${date.getHours()}:00`;
            else if (metricsTimeRange === '7d' || metricsTimeRange === '30d') key = `${date.getDate()}/${date.getMonth() + 1}`;
            else key = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][date.getMonth()];

            if (groupedData.has(key)) {
                const item = groupedData.get(key);
                if (e.event_type === 'view') item.views++;
                else if (e.event_type === 'click') item.clicks++;
            }
        });

        setMetricsData(Array.from(groupedData.values()));

    } catch (err) {
        console.error("Error fetching metrics:", err);
    } finally {
        setLoadingMetrics(false);
    }
  };

  const calculateCompletion = (data: any) => {
    // Eliminada 'city' de los campos requeridos para completar el perfil
    const fields = [
      { key: 'first_name' }, { key: 'last_name' }, { key: 'phone' }
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
        .select('first_name, last_name, phone, city, address, avatar_url, profile_color, is_verified, verification_status')
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
        setProfileColor(data.profile_color || "#0F172A");
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
      // Auto-guardar
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
        profile_color: profileColor,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      showSuccess("Perfil actualizado");
      setProfileData({...profileData, ...updates});
      calculateCompletion(updates);
      setView('dashboard');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleProcessBoost = async () => {
    if (!selectedServiceToBoost || !selectedBoostOption) return;
    setProcessingBoost(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const option = BOOST_OPTIONS.find(o => o.duration === selectedBoostOption);
        if(!option) return;

        const now = new Date();
        const futureDate = new Date(now.getTime() + option.duration * 60 * 60 * 1000);

        const { error } = await supabase
            .from('services')
            .update({ is_promoted: true, promoted_until: futureDate.toISOString() })
            .eq('id', selectedServiceToBoost.id);
        
        if (error) throw error;
        showSuccess(`¡Boost activado por ${option.label}!`);
        setBoostModalOpen(false);
        fetchMyServices(session.user.id);
    } catch (error: any) {
        showError("Error al procesar el boost");
        console.error(error);
    } finally {
        setProcessingBoost(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return showError("La contraseña debe tener al menos 6 caracteres");
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) showError(error.message);
    else {
      showSuccess("Contraseña actualizada exitosamente");
      setNewPassword("");
      setView('account-settings');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
       // Invocamos la Edge Function para que borre al usuario de auth.users (y cascada)
       const { error } = await supabase.functions.invoke('delete-user');
       
       if (error) {
         console.error(error);
         throw new Error("No se pudo completar la eliminación.");
       }

       await supabase.auth.signOut();
       navigate('/');
       showSuccess("Tu cuenta y datos han sido eliminados permanentemente.");
       
    } catch (error: any) {
       console.error("Error eliminando cuenta:", error);
       showError("Hubo un error al eliminar tu cuenta. Intenta de nuevo.");
    } finally {
       setIsDeleting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };
  const getProgressPercentage = () => Math.min((activeSeconds / REWARD_TARGET_SECONDS) * 100, 100);
  const getRemainingTime = () => formatTime(Math.max(0, REWARD_TARGET_SECONDS - activeSeconds));

  const fetchMyServices = async (uid: string) => {
    const { data } = await supabase.from('services')
        .select('*')
        .eq('user_id', uid)
        .is('deleted_at', null)
        .order('created_at', {ascending: false});
    setMyServices(data || []);
  };
  const fetchFavorites = async (uid?: string) => {
    const { data } = await supabase.from('favorites').select(`service_id, services:service_id(*)`).eq('user_id', uid || session.user.id);
    setMyFavorites(data?.map((i:any) => i.services).filter((s:any) => s && !s.deleted_at) || []);
  };
  const fetchReputation = async () => {
    const { data } = await supabase.from('reviews').select('*').eq('reviewee_id', session.user.id);
    setReviews(data || []);
    setAverageRating(data && data.length > 0 ? data.reduce((a:any,b:any)=>a+b.rating,0)/data.length : 0);
  };
  
  // Logic to handle click on delete
  const handleClickDelete = (service: any) => {
    const isBoosted = service.is_promoted && service.promoted_until && new Date(service.promoted_until) > new Date();
    
    if (isBoosted) {
      setServiceToDelete(service.id);
      setDeleteTimer(5);
      setShowBoostDeleteWarning(true);
    } else {
      handleConfirmDelete(service.id);
    }
  };

  const handleConfirmDelete = async (id: string | null) => {
    if (!id) return;
    
    // Si NO es a través del modal de boost (es decir, flujo normal), pedimos confirmación simple
    if (!showBoostDeleteWarning) {
        if (!confirm("¿Estás seguro de eliminar este servicio? Desaparecerá de las búsquedas, pero mantendrás tus métricas históricas.")) return;
    }

    const { error } = await supabase.from('services').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) { 
        showError("Error al eliminar"); 
    } else { 
        setMyServices(prev => prev.filter(s => s.id !== id)); 
        showSuccess("Servicio eliminado"); 
        setShowBoostDeleteWarning(false);
    }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/"); };
  const handleOpenMyServices = () => { setView('my-services'); fetchMyServices(session.user.id); };
  const handleOpenFavorites = (uid?: string) => { setView('favorites'); fetchFavorites(uid); };
  const handleOpenReputation = () => { setView('reputation'); fetchReputation(); };
  const handleBackToDashboard = () => { if(searchParams.get('view')) navigate('/profile', {replace:true}); setView('dashboard'); };

  const ProfileAvatar = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl", className?: string }) => {
    const sizeClasses = { sm: "h-8 w-8 text-xs", md: "h-12 w-12 text-lg", lg: "h-24 w-24 text-3xl", xl: "h-28 w-28 text-4xl" };
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarImage src={avatarUrl || profileData?.avatar_url} className="object-cover" />
        <AvatarFallback className="bg-gray-200 text-gray-500 font-bold">{firstName ? firstName[0].toUpperCase() : <User className="h-1/2 w-1/2" />}</AvatarFallback>
      </Avatar>
    );
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#F97316]" /></div>;

  // --- CHANGE PASSWORD VIEW ---
  if (view === 'change-password') {
    return (
        <div className="min-h-screen bg-white pb-20 pt-safe animate-fade-in">
           <div className="p-4 flex items-center gap-3">
               <Button variant="ghost" size="icon" onClick={() => setView('account-settings')}><ArrowLeft className="h-6 w-6" /></Button>
               <h1 className="text-xl font-bold">Cambiar Contraseña</h1>
           </div>
           
           <div className="p-6 space-y-6">
               <div className="flex justify-center mb-6">
                   <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center">
                       <Lock className="h-10 w-10 text-blue-500" />
                   </div>
               </div>
               
               <div className="space-y-4">
                   <div className="space-y-2">
                       <Label>Nueva Contraseña</Label>
                       <Input 
                            type="password" 
                            placeholder="Mínimo 6 caracteres" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                        />
                   </div>
                   <p className="text-xs text-gray-500">
                       Utiliza una contraseña segura que puedas recordar.
                   </p>
               </div>

               <div className="pt-4">
                   <Button onClick={handleUpdatePassword} disabled={passwordLoading || !newPassword} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200">
                        {passwordLoading ? <Loader2 className="animate-spin" /> : "Actualizar Contraseña"}
                   </Button>
               </div>
           </div>
        </div>
    )
  }

  // --- ACCOUNT SETTINGS VIEW ---
  if (view === 'account-settings') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
         <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Button variant="ghost" size="icon" onClick={() => setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button>
               <h1 className="text-lg font-bold">Administrar Cuenta</h1>
            </div>
         </div>

         <div className="p-5 space-y-6">
            
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Seguridad</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button 
                        onClick={() => setView('change-password')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Lock className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-gray-700">Cambiar Contraseña</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Sesión</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 text-gray-600 rounded-xl">
                                <LogOut className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-gray-700">Cerrar Sesión</span>
                        </div>
                    </button>

                     <button 
                        onClick={() => setShowDeleteAccountDialog(true)}
                        className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-100 transition-colors">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-red-600">Eliminar mi cuenta</span>
                        </div>
                    </button>
                </div>
            </div>
         </div>

         <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
          <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente tu perfil, servicios publicados y datos asociados de nuestros servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} className="rounded-xl border-gray-200">Cancelar</AlertDialogCancel>
              <AlertDialogAction disabled={isDeleting} onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 rounded-xl">
                  {isDeleting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Sí, eliminar cuenta"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // --- VERIFICATION VIEW (COMING SOON) ---
  if (view === 'verification') {
    return (
        <div className="min-h-screen bg-white pb-20 pt-safe animate-fade-in">
           <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Verificación</h1></div>
           </div>
           
           <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
               <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4 border-2 border-orange-100 relative">
                   <ShieldCheck className="h-10 w-10 text-[#F97316]" />
                   <div className="absolute -bottom-1 -right-1 bg-[#F97316] text-white p-1.5 rounded-full border-2 border-white">
                     <Hammer className="h-4 w-4" />
                   </div>
               </div>
               
               <div className="space-y-2 max-w-xs mx-auto">
                   <h2 className="text-2xl font-bold text-gray-900">¡Próximamente!</h2>
                   <p className="text-gray-500 text-sm leading-relaxed">
                       Estamos finalizando los detalles de nuestro sistema de verificación segura con IA para garantizar la confianza en la comunidad.
                   </p>
               </div>

               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full max-w-sm">
                   <div className="flex items-center gap-3 mb-2">
                       <Zap className="h-5 w-5 text-yellow-500" />
                       <span className="font-bold text-sm text-gray-700">Beneficios futuros</span>
                   </div>
                   <ul className="text-left text-xs text-gray-500 space-y-2 pl-1">
                       <li className="flex gap-2"><Check className="h-3 w-3 text-green-500" /> Insignia de "Verificado"</li>
                       <li className="flex gap-2"><Check className="h-3 w-3 text-green-500" /> Mayor visibilidad en búsquedas</li>
                       <li className="flex gap-2"><Check className="h-3 w-3 text-green-500" /> Más confianza de los clientes</li>
                   </ul>
               </div>

               <Button onClick={() => setView('dashboard')} className="w-full max-w-sm bg-[#F97316] hover:bg-orange-600 rounded-xl h-12 shadow-lg shadow-orange-100">
                   Entendido
               </Button>
           </div>
        </div>
    );
  }

  // --- METRICS VIEW ---
  if (view === 'metrics') {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
           <div className="bg-white p-4 shadow-sm sticky top-0 z-10 space-y-4">
              <div className="flex items-center gap-3">
                 <Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button>
                 <h1 className="text-lg font-bold">Métricas de Rendimiento</h1>
              </div>
              
              <div className="flex justify-between items-center bg-gray-100 p-1 rounded-lg">
                  {['24h', '7d', '30d', 'Año', 'Todo'].map((r) => {
                      const val = r === 'Año' ? '1y' : r === 'Todo' ? 'all' : r;
                      return (
                        <button 
                            key={r} 
                            onClick={() => setMetricsTimeRange(val)}
                            className={cn(
                                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all",
                                metricsTimeRange === val ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {r}
                        </button>
                      )
                  })}
              </div>
           </div>

           <div className="p-4 space-y-6">
               {loadingMetrics ? (
                   <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-gray-300" /></div>
               ) : (
                   <>
                       <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                               <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                                   <Eye className="h-3 w-3" /> Vistas Totales
                               </div>
                               <p className="text-2xl font-black text-gray-900">{totalViews}</p>
                           </div>
                           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                               <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                                   <MousePointerClick className="h-3 w-3" /> Contactos
                               </div>
                               <p className="text-2xl font-black text-gray-900">{totalClicks}</p>
                           </div>
                       </div>

                       <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                           <div className="flex justify-between items-center mb-6">
                               <h3 className="font-bold text-gray-900">Actividad</h3>
                               <div className="flex gap-4 text-xs">
                                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#F97316]"/> Vistas</div>
                                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> Clicks</div>
                               </div>
                           </div>
                           <div className="h-64 w-full">
                               {totalViews === 0 && totalClicks === 0 ? (
                                   <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                       No hay actividad en este periodo
                                   </div>
                               ) : (
                                   <ResponsiveContainer width="100%" height="100%">
                                       <AreaChart data={metricsData}>
                                           <defs>
                                               <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                   <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                                                   <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                                               </linearGradient>
                                               <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                   <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                                                   <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                               </linearGradient>
                                           </defs>
                                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                                           <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                                           <Tooltip 
                                               contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)'}} 
                                               itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                                           />
                                           <Area type="monotone" dataKey="views" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                           <Area type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                                       </AreaChart>
                                   </ResponsiveContainer>
                               )}
                           </div>
                       </div>
                   </>
               )}
           </div>
        </div>
    );
  }

  // --- REPUTATION VIEW ---
  if (view === 'reputation') {
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
    reviews.forEach(r => { const rating = Math.round(r.rating); if (rating >= 1 && rating <= 5) starCounts[rating]++; });
    const totalReviews = reviews.length || 1; 

    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
           <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Reputación</h1></div>
        </div>
        <div className="p-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="text-5xl font-black text-[#0F172A] mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex gap-1 mb-2">
                    {[1,2,3,4,5].map((star) => (<Star key={star} className={cn("h-5 w-5", star <= Math.round(averageRating) ? "fill-[#F97316] text-[#F97316]" : "text-gray-200 fill-gray-100")} />))}
                </div>
                <p className="text-gray-400 text-sm font-medium">{reviews.length} reseñas recibidas</p>
                <div className="w-full mt-6 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-3 text-xs"><span className="font-bold w-3 text-right text-gray-700">{star}</span><div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#F97316] rounded-full" style={{ width: `${(starCounts[star] / totalReviews) * 100}%` }} /></div><span className="text-gray-400 w-6 text-right">{starCounts[star]}</span></div>
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Comentarios recientes</h3>
                {reviews.length === 0 ? <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-dashed">Aún no tienes reseñas.</div> : (
                    reviews.map((r, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2"><div className="flex gap-1">{[...Array(5)].map((_, i) => (<Star key={i} className={cn("h-3 w-3", i < r.rating ? "fill-[#F97316] text-[#F97316]" : "text-gray-200")} />))}</div><span className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span></div>
                            <p className="text-gray-700 text-sm leading-relaxed">"{r.comment}"</p>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    )
  }

  // --- EDIT PROFILE VIEW ---
  if (view === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6"/></Button><h1 className="text-lg font-bold">Editar Perfil</h1></div>
          <Button onClick={updateProfile} disabled={updating} size="sm" className="bg-[#0F172A] text-white rounded-full px-4">{updating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Guardar"}</Button>
        </div>
        <div className="pb-10">
            <div className="relative mb-16">
                <div className="h-40 w-full transition-colors duration-500 shadow-inner" style={{ backgroundColor: profileColor }} />
                <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
                    <div className="relative group">
                         <div className="p-1 bg-white rounded-full shadow-lg"><ProfileAvatar size="xl" className="border-4 border-white" /></div>
                         <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-[#F97316] text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-orange-600 transition-transform hover:scale-110 active:scale-95 border-2 border-white">{uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}</label>
                         <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploadingAvatar} />
                    </div>
                </div>
            </div>
            <div className="px-6 space-y-8 mt-4">
                <div className="space-y-3 text-center">
                   <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color de Portada</Label>
                   <div className="flex flex-wrap justify-center gap-3">
                      {PROFILE_COLORS.map((color) => (
                        <button key={color.value} onClick={() => setProfileColor(color.value)} className={cn("w-10 h-10 rounded-full transition-all shadow-sm flex items-center justify-center relative", profileColor === color.value ? "ring-2 ring-offset-2 ring-gray-900 scale-110" : "hover:scale-105")} style={{ backgroundColor: color.value }} title={color.name}>{profileColor === color.value && <Check className="h-5 w-5 text-white drop-shadow-md" />}</button>
                      ))}
                   </div>
                </div>
                <div className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-gray-500 font-medium">Nombre</Label><Input value={firstName} onChange={e=>setFirstName(e.target.value)} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-gray-500 font-medium">Apellido</Label><Input value={lastName} onChange={e=>setLastName(e.target.value)} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl" /></div>
                    </div>
                    <div className="space-y-2"><Label className="text-gray-500 font-medium">Teléfono</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl" /></div></div>
                    <div className="space-y-2"><Label className="text-gray-500 font-medium">Ciudad</Label><Select value={city} onValueChange={setCity}><SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white rounded-xl"><SelectValue placeholder="Selecciona tu ciudad"/></SelectTrigger><SelectContent className="bg-white max-h-[200px]">{DR_CITIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- MY SERVICES VIEW ---
  if (view === 'my-services') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
        {/* Boost Protection Dialog */}
        <AlertDialog open={showBoostDeleteWarning} onOpenChange={setShowBoostDeleteWarning}>
          <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto border-red-100 shadow-2xl">
            <AlertDialogHeader className="text-center">
               <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-2 animate-pulse">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
               </div>
              <AlertDialogTitle className="text-xl font-bold text-center text-red-600">¡Servicio Destacado!</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-600 mt-2 space-y-2">
                <p>Este servicio tiene un Boost activo. Si lo eliminas ahora:</p>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-left text-xs font-medium text-red-700">
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Perderás el dinero o créditos invertidos.</li>
                        <li>El tiempo restante de promoción se anulará.</li>
                        <li>Esta acción NO se puede deshacer.</li>
                    </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowBoostDeleteWarning(false)} className="w-full rounded-xl border-gray-200 mt-2">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                    disabled={deleteTimer > 0} 
                    onClick={() => handleConfirmDelete(serviceToDelete)} 
                    className="w-full bg-red-600 hover:bg-red-700 rounded-xl font-bold h-12"
                >
                    {deleteTimer > 0 ? `Espera ${deleteTimer}s...` : "Sí, perder Boost y eliminar"}
                </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={boostModalOpen} onOpenChange={setBoostModalOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl">
                <DialogHeader className="space-y-3 pb-2"><div className="mx-auto bg-gradient-to-br from-[#F97316] to-pink-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30"><Rocket className="h-7 w-7 text-white" /></div><DialogTitle className="text-center text-xl font-bold">Impulsa tu publicación</DialogTitle><DialogDescription className="text-center text-gray-500">Elige un plan para destacar tu servicio.</DialogDescription></DialogHeader>
                <div className="flex flex-col gap-3 py-4">{BOOST_OPTIONS.map((opt) => (<div key={opt.duration} onClick={() => setSelectedBoostOption(opt.duration)} className={cn("cursor-pointer rounded-2xl border-2 p-4 flex items-center justify-between transition-all relative overflow-hidden group", selectedBoostOption === opt.duration ? "border-[#F97316] bg-orange-50/50 shadow-md" : "border-gray-100 bg-white hover:border-orange-100")}>{opt.popular && (<div className="absolute top-0 right-0 bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">MEJOR VALOR</div>)}<div className="flex items-center gap-3"><div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedBoostOption === opt.duration ? "border-[#F97316]" : "border-gray-300")}>{selectedBoostOption === opt.duration && <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}</div><div><h3 className="font-bold text-gray-900">{opt.label}</h3><p className="text-xs text-gray-400">Visibilidad Premium</p></div></div><div className="text-right"><p className="text-[#F97316] font-black text-lg">RD$ {opt.price}</p></div></div>))}</div>
                <Button onClick={handleProcessBoost} disabled={!selectedBoostOption || processingBoost} className="w-full h-12 text-lg font-bold bg-[#F97316] hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-500/20">{processingBoost ? <Loader2 className="animate-spin" /> : "Pagar y Activar"}</Button>
            </DialogContent>
        </Dialog>
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Mis Publicaciones</h1></div><Button size="sm" variant="default" className="bg-[#0F172A] rounded-full px-4 text-xs font-bold" onClick={()=>navigate('/publish')}>+ Nueva</Button></div>
        <div className="p-4 space-y-4">
           {myServices.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Briefcase className="h-8 w-8 text-gray-400" /></div><h3 className="font-bold text-gray-900">No tienes servicios</h3><p className="text-gray-500 text-sm mb-6 max-w-[200px]">Publica tu primer servicio para empezar a ganar clientes.</p><Button onClick={()=>navigate('/publish')} className="bg-[#F97316] rounded-xl">Crear Servicio</Button></div> : (
             myServices.map(s => {
                const isPromoted = s.is_promoted && s.promoted_until && new Date(s.promoted_until) > new Date();
                let remainingLabel = "";
                if (isPromoted && s.promoted_until) {
                    const now = new Date(); const end = new Date(s.promoted_until); const diffMs = end.getTime() - now.getTime(); const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60)); const diffDays = Math.ceil(diffHrs / 24);
                    if (diffDays > 1) remainingLabel = `${diffDays} días restantes`; else remainingLabel = `${diffHrs}h restantes`;
                }
                return (
                 <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative group overflow-hidden">
                   {isPromoted && (<div className="absolute top-0 right-0 bg-[#F97316] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1"><Crown className="h-3 w-3 fill-white" /> DESTACADO</div>)}
                   <div className="flex gap-4">
                       <div className="h-24 w-24 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden cursor-pointer" onClick={()=>navigate(`/service/${s.id}`)}><img src={s.image_url || "/placeholder.svg"} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                       <div className="flex-1 min-w-0 flex flex-col justify-between">
                           <div><div className="flex justify-between items-start pr-8"><h3 className="font-bold text-gray-900 truncate leading-tight">{s.title}</h3><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-gray-400"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="rounded-xl"><DropdownMenuItem onClick={()=>navigate(`/service/${s.id}`)}><Check className="mr-2 h-4 w-4" /> Ver detalle</DropdownMenuItem><DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={()=>handleClickDelete(s)}><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><p className="text-[#F97316] font-bold text-sm">RD$ {s.price}</p><div className="flex items-center gap-1 mt-1 text-xs text-gray-400"><CalendarRange className="h-3 w-3" />{new Date(s.created_at).toLocaleDateString()}</div></div>
                           <div className="flex items-center gap-2 mt-3">{!isPromoted ? (<Button size="sm" onClick={() => {setSelectedServiceToBoost(s);setSelectedBoostOption(72);setBoostModalOpen(true);}} className="flex-1 bg-gray-900 text-white hover:bg-gray-800 h-8 rounded-lg text-xs font-bold shadow-sm"><TrendingUp className="h-3 w-3 mr-1.5 text-yellow-400" /> Impulsar</Button>) : (<div className="flex-1 bg-orange-50 border border-orange-100 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-[#F97316]"><Clock className="h-3 w-3 mr-1.5" /> {remainingLabel || "Activo"}</div>)}</div>
                       </div>
                   </div>
                 </div>
               );
             })
           )}
        </div>
      </div>
    )
  }

  // --- FAVORITES VIEW ---
  if (view === 'favorites') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={handleBackToDashboard}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Mis Favoritos</h1></div></div>
        <div className="p-4">{myFavorites.length === 0 ? <div className="text-center py-10 text-gray-500">Sin favoritos</div> : (<div className="grid grid-cols-2 gap-4">{myFavorites.map((s) => <div key={s.id} onClick={()=>navigate(`/service/${s.id}`)}><ServiceCard title={s.title} price={`RD$ ${s.price}`} image={s.image_url} /></div>)}</div>)}</div>
      </div>
    );
  }

  // --- REWARDS VIEW ---
  if (view === 'rewards') {
    return (
      <div className="min-h-screen bg-white pb-20 pt-safe animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10"><div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#F97316] rounded-full blur-[80px] animate-pulse" /><div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-400 rounded-full blur-[80px] animate-pulse delay-1000" /></div>
        <div className="relative z-10">
          <div className="p-4 flex items-center justify-between"><Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-gray-500 hover:bg-gray-100 rounded-full"><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold text-gray-900">Mis Recompensas</h1><div className="w-10" /></div>
          <div className="flex flex-col items-center justify-center mt-4 space-y-6 px-6">
             <div className="text-center space-y-2"><div className="inline-flex items-center justify-center p-4 bg-orange-50 rounded-full border border-orange-100 mb-2 shadow-sm"><Zap className="h-10 w-10 text-[#F97316] fill-[#F97316]" /></div><h2 className="text-4xl font-black tracking-tight text-gray-900">{userStats?.boosts || 0}</h2><p className="text-gray-500 font-medium">Boosts Disponibles</p><Button variant="link" className="text-[#F97316] text-xs h-auto p-0 hover:text-orange-700" onClick={() => navigate('/publish')}>Usar en nueva publicación</Button></div>
             <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-xl text-center space-y-6 relative overflow-hidden"><div className="flex items-center justify-center gap-2 text-[#F97316]"><Clock className={`h-5 w-5 ${!canClaim ? "animate-spin-slow" : ""}`} /><span className="font-bold tracking-widest text-sm uppercase">Tiempo Activo</span></div><div className="space-y-2"><div className="font-mono text-4xl font-bold tracking-wider text-gray-900 tabular-nums">{formatTime(activeSeconds)} <span className="text-base text-gray-400 font-normal">/ 5h</span></div><div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 relative"><div className="h-full bg-gradient-to-r from-[#F97316] to-yellow-500 transition-all duration-1000 ease-out relative" style={{ width: `${getProgressPercentage()}%` }} /></div><p className="text-xs text-gray-500">{canClaim ? "¡Meta alcanzada!" : `Faltan ${getRemainingTime()} de uso`}</p></div><Button onClick={handleClaimReward} disabled={!canClaim || claiming} className={`w-full h-12 rounded-xl text-lg font-bold transition-all transform ${canClaim ? "bg-[#F97316] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/40 scale-105 animate-pulse" : "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-200"}`}>{claiming ? <Loader2 className="animate-spin" /> : canClaim ? "¡Reclamar Boost!" : "Sigue usándola..."}</Button></div>
          </div>
        </div>
      </div>
    );
  }

  // --- PREVIEW VIEW ---
  if (view === 'preview') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe relative">
        <div className="absolute top-0 left-0 right-0 h-72 rounded-b-[3rem] z-0 shadow-lg transition-colors duration-500" style={{ backgroundColor: profileColor }} />
        <div className="relative z-10 px-4 pt-4">
          <div className="flex justify-between items-center text-white mb-2"><Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-white hover:bg-white/20"><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Mi Perfil</h1><Button variant="ghost" size="icon" onClick={() => setView('edit')} className="text-white hover:bg-white/20"><Edit2 className="h-5 w-5" /></Button></div>
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center mt-24 space-y-4 border border-gray-100">
            <div className="relative -mt-20 mb-4 flex justify-center"><div className="p-2 bg-white rounded-full shadow-sm"><ProfileAvatar size="xl" className="border-4 border-white" /></div></div>
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                    <h2 className="text-2xl font-bold">{firstName} {lastName}</h2>
                    {profileData?.is_verified && <ShieldCheck className="h-5 w-5 text-green-500" />}
                </div>
                <p className="text-gray-500 text-sm">{session?.user.email}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 pt-4 text-left border-t border-gray-50"><div className="flex gap-3"><Phone className="text-gray-400 h-4 w-4"/><span>{phone || "No agregado"}</span></div><div className="flex gap-3"><MapPin className="text-gray-400 h-4 w-4"/><span>{city || "No agregado"}</span></div></div>
          </div>
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
            <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-bold text-[#0F172A] truncate max-w-[200px]">{firstName || 'Usuario'}</h1>
                {profileData?.is_verified && <ShieldCheck className="h-5 w-5 text-green-500" />}
            </div>
          </div>
          <div onClick={() => setView('preview')} className="cursor-pointer">
             <ProfileAvatar size="md" className="border-2 border-orange-100" />
          </div>
        </div>
        <div className="flex justify-between gap-2 pb-2">
          <QuickAction icon={User} label="Perfil" onClick={() => setView('preview')} />
          <QuickAction icon={Star} label="Reputación" onClick={handleOpenReputation} />
          <QuickAction icon={ShieldCheck} label="Verificación" onClick={() => setView('verification')} />
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
            <MenuItem icon={BarChart3} label="Métricas" onClick={() => setView('metrics')} />
            <MenuItem icon={Gift} label="Recompensas" badge={canClaim ? "!" : undefined} onClick={() => setView('rewards')} />
          </MenuSection>

          <MenuSection title="Preferencias">
            <MenuItem icon={Settings} label="Administrar Cuenta" onClick={() => setView('account-settings')} />
          </MenuSection>
        </div>
      </div>
    </div>
  );
};

const MenuSection = ({ title, children }: any) => (<div><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">{title}</h3><div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">{children}</div></div>);
const QuickAction = ({ icon: Icon, label, onClick }: any) => (<button onClick={onClick} className="flex flex-col items-center gap-2 group flex-1"><div className="w-14 h-14 bg-orange-50/80 group-hover:bg-[#F97316] rounded-2xl flex items-center justify-center transition-all shadow-sm border border-orange-100/50"><Icon className="h-6 w-6 text-[#F97316] group-hover:text-white transition-colors" strokeWidth={2} /></div><span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#F97316]">{label}</span></button>);
const MenuItem = ({ icon: Icon, label, onClick, isDestructive, badge }: any) => (<button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-orange-50/30 transition-colors group relative"><div className="flex items-center gap-4"><div className={`p-2 rounded-xl ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-orange-50/50 text-[#F97316]'} transition-all`}><Icon className="h-5 w-5" strokeWidth={2} /></div><span className={`font-semibold text-sm ${isDestructive ? 'text-red-500' : 'text-gray-700'}`}>{label}</span></div><div className="flex items-center gap-3">{badge && (<span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${badge === "!" ? "bg-red-500 animate-pulse" : "bg-[#F97316]"}`}>{badge}</span>)}<ChevronRight className="h-4 w-4 text-gray-300" /></div></button>);

const Rocket = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
)

export default Profile;