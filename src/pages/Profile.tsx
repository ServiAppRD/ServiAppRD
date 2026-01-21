import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { showSuccess, showError } from "@/utils/toast";
import { 
  Loader2, LogOut, User, Phone, MapPin, Heart, 
  HelpCircle, ChevronRight, Star, 
  ArrowLeft, Edit2, Briefcase, Trash2, Camera, Zap, Check,
  Clock, TrendingUp, Crown, BarChart3, ShieldCheck, Eye, MousePointerClick, CalendarRange,
  AlertTriangle, Hammer, Lock, Shield, MoreHorizontal, FileText, Bell, CreditCard, Sparkles, X,
  Plus, Rocket as RocketIcon, Calendar, MessageCircle, Settings, Timer
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceCard } from "@/components/ServiceCard";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusSuccessOverlay } from "@/components/PlusSuccessOverlay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

const DR_PROVINCES = [
  "Azua", "Baoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte", 
  "Elías Piña", "El Seibo", "Espaillat", "Hato Mayor", "Hermanas Mirabal", 
  "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez", 
  "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia", 
  "Puerto Plata", "Samaná", "San Cristóbal", "San José de Ocoa", "San Juan", 
  "San Pedro de Macorís", "Sánchez Ramírez", "Santiago", "Santiago Rodríguez", 
  "Santo Domingo", "Valverde"
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

const BOOST_OPTIONS = [
  { label: "1 Día", duration: 24, price: 299, popular: false },
  { label: "3 Días", duration: 72, price: 499, popular: true },
  { label: "7 Días", duration: 168, price: 999, popular: false },
];

const SLOT_LIMIT_FREE = 5;
const SLOT_LIMIT_PLUS = 10;
const TOTAL_DISPLAY_SLOTS = 10; 

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<'dashboard' | 'edit' | 'preview' | 'my-services' | 'reputation' | 'favorites' | 'metrics' | 'verification' | 'account-settings' | 'change-password' | 'serviapp-plus' | 'my-plan' | 'notifications' | 'help'>('dashboard');
  
  const [session, setSession] = useState<any>(null);
  
  const [profileData, setProfileData] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState(""); 
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileColor, setProfileColor] = useState("#0F172A");
  const [isPlus, setIsPlus] = useState(false);
  const [plusExpiresAt, setPlusExpiresAt] = useState<string | null>(null);
  
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [buyingPlus, setBuyingPlus] = useState(false);
  const [showPlusSuccess, setShowPlusSuccess] = useState(false);

  const [myServices, setMyServices] = useState<any[]>([]);
  const [myFavorites, setMyFavorites] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const [metricsTimeRange, setMetricsTimeRange] = useState('7d');
  const [metricsData, setMetricsData] = useState<any[]>([]);
  const [recentViewers, setRecentViewers] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedServiceToBoost, setSelectedServiceToBoost] = useState<any>(null);
  const [selectedBoostOption, setSelectedBoostOption] = useState<number | null>(null);
  const [processingBoost, setProcessingBoost] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showBoostDeleteWarning, setShowBoostDeleteWarning] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [deleteTimer, setDeleteTimer] = useState(5);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeBoosts, setActiveBoosts] = useState<any[]>([]);

  const maxSlots = isPlus ? SLOT_LIMIT_PLUS : SLOT_LIMIT_FREE;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      } else {
        getProfile(session.user.id);
        fetchMyServices(session.user.id);
        
        const viewParam = searchParams.get('view');
        if (viewParam === 'favorites') handleOpenFavorites(session.user.id);
      }
    });
  }, [navigate, searchParams]);

  useEffect(() => {
    if (view === 'metrics' && session?.user?.id) {
        fetchRealMetrics();
    }
    if (view === 'my-plan' && session?.user?.id) {
        fetchPlanData();
    }
  }, [view, metricsTimeRange, session]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showBoostDeleteWarning && deleteTimer > 0) {
      timer = setTimeout(() => setDeleteTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showBoostDeleteWarning, deleteTimer]);

  const fetchPlanData = async () => {
      try {
          // 1. Limpiar boosts vencidos en la BD
          await supabase.rpc('handle_expired_boosts');

          // 2. Fetch transacciones
          const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
          
          if (txData) setTransactions(txData);

          // 3. Fetch Boosts Activos
          const { data: boostData } = await supabase
            .from('services')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('is_promoted', true)
            .gt('promoted_until', new Date().toISOString());
          
          setActiveBoosts(boostData || []);

      } catch (e) {
          console.error("Error fetching plan data", e);
      }
  };

  const getBoostPrice = (serviceTitle: string) => {
      // Intentar encontrar la transacción correspondiente
      const tx = transactions.find(t => t.type === 'boost' && t.description.includes(serviceTitle));
      return tx ? tx.amount : "---";
  };

  const calculateTimeLeft = (dateString: string) => {
      const now = new Date();
      const end = new Date(dateString);
      const diffMs = end.getTime() - now.getTime();
      
      if (diffMs <= 0) return "Vencido";
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays} días`;
      return `${diffHours} horas`;
  };

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
            .select('event_type, created_at, viewer_id')
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

        const viewerIds = events?.map(e => e.viewer_id).filter(Boolean) || [];
        const uniqueViewerIds = [...new Set(viewerIds)];

        if (uniqueViewerIds.length > 0) {
            const { data: viewersData } = await supabase
               .from('profiles')
               .select('id, first_name, last_name, avatar_url')
               .in('id', uniqueViewerIds);
            
            const recentVisits = events
               ?.filter(e => e.event_type === 'view' && e.viewer_id)
               .map(e => {
                   const profile = viewersData?.find(v => v.id === e.viewer_id);
                   return profile ? { ...profile, visited_at: e.created_at } : null;
               })
               .filter(Boolean)
               .reverse() 
               .slice(0, 10); 

            setRecentViewers(recentVisits || []);
        } else {
            setRecentViewers([]);
        }

    } catch (err) {
        console.error("Error fetching metrics:", err);
    } finally {
        setLoadingMetrics(false);
    }
  };

  const calculateCompletion = (data: any) => {
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
        .select('first_name, last_name, phone, city, address, avatar_url, profile_color, is_verified, verification_status, is_plus, plus_expires_at')
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
        setIsPlus(data.is_plus || false);
        setPlusExpiresAt(data.plus_expires_at || null);
        calculateCompletion(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPlus = async () => {
      setBuyingPlus(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          const { error } = await supabase.from('profiles').update({ 
              is_plus: true, 
              plus_expires_at: nextMonth.toISOString()
          }).eq('id', session.user.id);
          
          if (error) throw error;

          await supabase.from('transactions').insert({
              user_id: session.user.id,
              amount: 499,
              description: "Suscripción ServiAPP Plus (1 Mes)",
              type: "subscription"
          });
          
          setIsPlus(true);
          setPlusExpiresAt(nextMonth.toISOString());
          setView('dashboard'); 
          setShowPlusSuccess(true); // Activar la notificación
      } catch (e: any) {
          showError("Error al procesar suscripción");
      } finally {
          setBuyingPlus(false);
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

        await supabase.from('transactions').insert({
            user_id: session.user.id,
            amount: option.price,
            description: `Boost ${option.label} - ${selectedServiceToBoost.title}`,
            type: "boost"
        });

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
    if (isPlus) return; // Doble verificación por seguridad

    setIsDeleting(true);
    try {
       // Llamamos a la Edge Function 'delete-user' que se encarga de borrar de auth.users
       const { error } = await supabase.functions.invoke('delete-user');
       
       if (error) {
         console.error(error);
         throw new Error("No se pudo completar la eliminación.");
       }

       // Si la función tuvo éxito, cerramos sesión local y enviamos al inicio
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

  const handleEditService = (serviceId: string) => {
     navigate(`/edit-service/${serviceId}`);
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

  const renderCurrentView = () => {
      switch (view) {
          case 'help':
            return (
                <div className="fixed inset-0 z-[1000] bg-gray-50 flex flex-col animate-fade-in overflow-y-auto">
                   <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between pt-12">
                      <div className="flex items-center gap-3">
                         <Button variant="ghost" size="icon" onClick={() => setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button>
                         <h1 className="text-lg font-bold">Centro de Ayuda</h1>
                      </div>
                   </div>
                   <div className="p-5 space-y-6 pb-24">
                       <div className="text-center space-y-2 py-4">
                           <div className="bg-orange-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-[#F97316] mb-2">
                               <HelpCircle className="h-8 w-8" />
                           </div>
                           <h2 className="text-xl font-bold text-gray-900">¿Cómo podemos ayudarte?</h2>
                           <p className="text-sm text-gray-500">Encuentra respuestas a las dudas más comunes.</p>
                       </div>

                       <Accordion type="single" collapsible className="w-full space-y-3">
                            <AccordionItem value="item-1" className="bg-white border rounded-2xl px-4 py-1 shadow-sm border-gray-100">
                                <AccordionTrigger className="hover:no-underline font-bold text-gray-800 text-left">¿Cómo contacto a un técnico?</AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                                    Es muy sencillo. Solo tienes que buscar el servicio que necesitas, entrar a su publicación y en la parte inferior verás los botones de <span className="font-bold text-green-600">WhatsApp</span> y <span className="font-bold text-gray-900">Llamar</span>. El contacto es directo con el profesional.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2" className="bg-white border rounded-2xl px-4 py-1 shadow-sm border-gray-100">
                                <AccordionTrigger className="hover:no-underline font-bold text-gray-800 text-left">¿Es seguro contratar por aquí?</AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed pt-2 space-y-3">
                                    <p>En ServiAPP trabajamos para que sea seguro. Contamos con dos sistemas clave:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-bold">Reseñas reales:</span> Mira las estrellas y comentarios que otros clientes han dejado en el perfil del técnico.</li>
                                        <li><span className="font-bold text-[#0239c7]">Sello Plus:</span> Los usuarios Plus han verificado su información con nosotros.</li>
                                    </ul>
                                    <p className="text-xs italic bg-gray-50 p-2 rounded-lg border">Consejo: Nunca pagues por adelantado sin haber conocido al técnico o revisado su trabajo.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3" className="bg-white border rounded-2xl px-4 py-1 shadow-sm border-gray-100">
                                <AccordionTrigger className="hover:no-underline font-bold text-gray-800 text-left">¿Qué hago si un técnico no llega?</AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                                    ServiAPP es una plataforma de contacto, por lo que no gestionamos directamente las citas. Si un profesional no cumple:
                                    <ol className="list-decimal pl-5 mt-2 space-y-2">
                                        <li>Intenta contactarlo por WhatsApp.</li>
                                        <li>Deja una reseña en su perfil explicando lo sucedido para alertar a otros.</li>
                                        <li>Usa el botón de <span className="font-bold text-red-500">Reportar</span> en su anuncio si sospechas de una estafa.</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4" className="bg-white border rounded-2xl px-4 py-1 shadow-sm border-gray-100">
                                <AccordionTrigger className="hover:no-underline font-bold text-gray-800 text-left">¿Cómo funcionan los Boosts?</AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                                    Los Boosts sirven para que tu anuncio aparezca en los **primeros lugares** de la búsqueda y en la sección de destacados de la pantalla principal. Puedes elegir duraciones de <span className="font-bold">24 horas, 3 días o 7 días</span>. Al terminar el tiempo, tu anuncio volverá a su posición normal.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5" className="bg-white border rounded-2xl px-4 py-1 shadow-sm border-gray-100">
                                <AccordionTrigger className="hover:no-underline font-bold text-gray-800 text-left">¿Por qué no veo mi anuncio?</AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                                    Hay varias razones:
                                    <ul className="list-disc pl-5 mt-2 space-y-2">
                                        <li><span className="font-bold">Expiración:</span> Si tenías un Boost, este pudo haber terminado.</li>
                                        <li><span className="font-bold">Revisión:</span> Si el anuncio infringe normas, puede ser pausado.</li>
                                        <li><span className="font-bold">Límite:</span> Recuerda que el plan gratis permite hasta 5 anuncios activos.</li>
                                    </ul>
                                    Revisa la sección "Mis Publicaciones" para ver el estado actual.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-6" className="bg-white border rounded-2xl px-4 py-1 shadow-sm border-gray-100">
                                <AccordionTrigger className="hover:no-underline font-bold text-gray-800 text-left">¿Cómo verifico mi perfil?</AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                                    Actualmente el sello de verificación se obtiene al suscribirse al **Plan Plus**. Muy pronto habilitaremos una verificación gratuita adicional mediante escaneo de documentos con IA para aumentar la confianza en tu perfil.
                                </AccordionContent>
                            </AccordionItem>
                       </Accordion>

                       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-4 text-center space-y-4">
                           <h3 className="font-bold text-gray-900">¿Todavía tienes dudas?</h3>
                           <p className="text-xs text-gray-500">Nuestro equipo de soporte está disponible por correo electrónico.</p>
                           <Button variant="outline" className="w-full h-12 rounded-xl border-[#F97316] text-[#F97316] hover:bg-orange-50 font-bold" onClick={() => window.location.href = 'mailto:serviapp.help@gmail.com'}>
                               <MessageCircle className="mr-2 h-5 w-5" /> Contactar Soporte
                           </Button>
                       </div>
                   </div>
                </div>
            );

          case 'serviapp-plus':
            return (
                <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-fade-in">
                   <div className="relative bg-[#0239c7] text-white rounded-b-[40px] overflow-hidden pb-8 shrink-0">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-[#0a46eb] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                       <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#3b82f6] rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 opacity-20"></div>
                       <div className="relative z-10 px-4 pt-12 flex items-center justify-between h-16">
                          <button onClick={() => setView('dashboard')} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                              <X className="h-6 w-6 text-white" />
                          </button>
                          <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full">
                              <span className="font-black italic text-sm tracking-wider">PLUS</span>
                          </div>
                          <div className="w-10" />
                       </div>
                       <div className="relative z-10 px-6 pt-4 pb-6 flex flex-col md:flex-row md:items-center gap-6">
                           <div className="space-y-3 flex-1">
                               <p className="text-blue-100 font-medium text-sm">Suscríbete y destaca tu perfil</p>
                               <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-white">
                                   Verificación y<br/>
                                   beneficios<br/>
                                   exclusivos
                               </h1>
                           </div>
                           <div className="hidden md:block w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                              <Crown className="h-16 w-16 text-[#F97316]" />
                           </div>
                       </div>
                   </div>
                   <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 pb-[180px]">
                       <div className="space-y-6">
                           <div className="flex items-start gap-4">
                               <div className="mt-1"><ShieldCheck className="h-6 w-6 text-gray-900" strokeWidth={2.5} /></div>
                               <div>
                                   <h3 className="font-bold text-gray-900 text-sm md:text-base">Insignia de Verificación inmediata</h3>
                                   <p className="text-xs text-gray-500 mt-0.5">Genera máxima confianza en tus clientes.</p>
                               </div>
                           </div>
                           <div className="flex items-start gap-4">
                               <div className="mt-1"><TrendingUp className="h-6 w-6 text-gray-900" strokeWidth={2.5} /></div>
                               <div>
                                   <h3 className="font-bold text-gray-900 text-sm md:text-base">Posicionamiento Prioritario</h3>
                                   <p className="text-xs text-gray-500 mt-0.5">Aparece antes que la competencia en búsquedas.</p>
                               </div>
                           </div>
                           <div className="flex items-start gap-4">
                               <div className="mt-1"><BarChart3 className="h-6 w-6 text-gray-900" strokeWidth={2.5} /></div>
                               <div>
                                   <h3 className="font-bold text-gray-900 text-sm md:text-base">Métricas Avanzadas de Negocio</h3>
                                   <p className="text-xs text-gray-500 mt-0.5">Descubre quién visita tu perfil y cuándo.</p>
                               </div>
                           </div>
                            <div className="flex items-start gap-4">
                               <div className="mt-1"><Zap className="h-6 w-6 text-gray-900" strokeWidth={2.5} /></div>
                               <div>
                                   <h3 className="font-bold text-gray-900 text-sm md:text-base">Publicaciones Ilimitadas ({SLOT_LIMIT_PLUS})</h3>
                                   <p className="text-xs text-gray-500 mt-0.5">Duplica tu capacidad de publicación.</p>
                               </div>
                           </div>
                       </div>
                       <div className="pt-4">
                           <h3 className="font-bold text-lg text-gray-900">¿Listo para crecer?</h3>
                           <p className="text-gray-500 text-sm mt-1">Cancela tu suscripción cuando quieras.</p>
                       </div>
                   </div>
                   <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 pb-safe z-20 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
                       <div className="max-w-md mx-auto flex flex-col gap-3">
                           <div className="flex justify-between items-end mb-1">
                              <span className="text-sm font-medium text-gray-500">Total a pagar</span>
                              <div className="text-right">
                                   <span className="text-xs text-gray-400 line-through mr-2">RD$ 899</span>
                                   <span className="text-2xl font-black text-gray-900">RD$ 499</span>
                                   <span className="text-xs font-bold text-[#0239c7] ml-1">/mes</span>
                              </div>
                           </div>
                           <Button onClick={handleBuyPlus} disabled={buyingPlus || isPlus} className="w-full h-14 bg-[#0239c7] hover:bg-[#022b9e] text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20">
                               {buyingPlus ? <Loader2 className="animate-spin" /> : (isPlus ? "Ya eres Plus" : "Suscribirme a Plus")}
                           </Button>
                           <p className="text-center text-[10px] text-gray-400">
                               Al continuar, aceptas los <span className="underline cursor-pointer">términos y condiciones</span>.
                           </p>
                       </div>
                   </div>
                </div>
            );

          case 'my-plan':
            const renewalDate = plusExpiresAt ? new Date(plusExpiresAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : "Sin vencimiento";
            
            return (
                <div className="fixed inset-0 z-[1000] bg-gray-100 flex flex-col animate-fade-in overflow-y-auto">
                   <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center pt-6">
                      <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="-ml-2 mr-2">
                          <ArrowLeft className="h-6 w-6 text-black" />
                      </Button>
                      <h1 className="text-xl font-bold text-black">Mi Plan</h1>
                   </div>

                   <div className="p-6">
                       <div className="bg-white rounded-[2rem] p-6 shadow-sm mb-8">
                           <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center mb-4 shadow-sm overflow-hidden">
                               <img src="/serviapp-s-logo.png" className="w-full h-full object-cover" alt="Logo" /> 
                           </div>
                           
                           <h2 className="text-2xl font-black text-gray-900 mb-6">
                               {isPlus ? "ServiAPP Plus" : "ServiAPP Básico"}
                           </h2>

                           <div className="border-t border-gray-100 my-4" />

                           <div className="space-y-3">
                               <div className="flex items-center gap-3">
                                   <CreditCard className="h-5 w-5 text-gray-800" />
                                   <span className="text-sm font-medium text-gray-700">
                                       {isPlus ? "RD$499 al mes" : "Gratis"}
                                   </span>
                               </div>
                               <div className="flex items-center gap-3">
                                   <Calendar className="h-5 w-5 text-gray-800" />
                                   <span className="text-sm font-medium text-gray-700">
                                       {isPlus ? `${renewalDate}` : "Siempre activo"}
                                   </span>
                               </div>
                           </div>
                       </div>

                       {/* ACTIVE BOOSTS SECTION */}
                       {activeBoosts.length > 0 && (
                           <div className="mb-8">
                               <div className="relative flex items-center justify-center mb-4">
                                   <div className="bg-white px-4 rounded-full py-1 z-10 shadow-sm border border-gray-100">
                                       <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                           <TrendingUp className="h-4 w-4 text-[#F97316]" /> BOOSTS ACTIVOS
                                       </h3>
                                   </div>
                                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div> 
                               </div>

                               <div className="space-y-3">
                                   {activeBoosts.map((boost) => (
                                       <div key={boost.id} className="bg-white border border-orange-100 p-4 rounded-3xl shadow-sm relative overflow-hidden">
                                           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F97316]" />
                                           <div className="flex justify-between items-start mb-2 pl-2">
                                               <div>
                                                   <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                       <RocketIcon className="h-4 w-4 text-[#F97316] fill-[#F97316]" />
                                                       Boost Activo
                                                   </h4>
                                                   <p className="text-xs text-gray-500 font-medium mt-0.5 truncate max-w-[150px]">
                                                       {boost.title}
                                                   </p>
                                               </div>
                                               <Badge className="bg-orange-100 text-[#F97316] border-0 text-[10px]">
                                                   <Timer className="h-3 w-3 mr-1" />
                                                   {calculateTimeLeft(boost.promoted_until)}
                                               </Badge>
                                           </div>
                                           <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-xs pl-2">
                                               <span className="text-gray-400">Pagado: <span className="text-gray-900 font-bold">RD$ {getBoostPrice(boost.title)}</span></span>
                                               <span className="text-gray-400">Vence: {new Date(boost.promoted_until).toLocaleDateString()}</span>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}

                       {!isPlus && (
                           <div onClick={() => setView('serviapp-plus')} className="bg-[#0239c7] rounded-[2rem] p-6 shadow-lg shadow-blue-200 mb-8 cursor-pointer flex items-center justify-between">
                                <div className="text-white">
                                    <h3 className="font-bold text-lg">Mejorar a Plus</h3>
                                    <p className="text-xs opacity-80">Desbloquea todos los beneficios</p>
                                </div>
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Crown className="h-6 w-6 text-white" />
                                </div>
                           </div>
                       )}

                       <div className="relative flex items-center justify-center mb-6">
                           <div className="bg-white px-4 rounded-full py-1 z-10 shadow-sm border border-gray-100">
                               <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">HISTORIAL DE PAGOS</h3>
                           </div>
                           <div className="absolute inset-0 flex items-center">
                               <div className="w-full border-t border-gray-300" />
                           </div> 
                       </div>

                       <div className="space-y-4 pb-24">
                           {transactions.length === 0 && !isPlus && (
                              <div className="bg-white p-4 rounded-3xl w-full flex items-center justify-between shadow-sm opacity-70">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                          <User className="h-5 w-5" />
                                      </div>
                                      <div>
                                          <p className="font-bold text-gray-900">Plan Gratuito</p>
                                          <p className="text-xs text-gray-500">Siempre activo</p>
                                      </div>
                                  </div>
                                  <span className="font-bold text-gray-900">RD$ 0.00</span>
                              </div>
                           )}

                           {transactions.map((tx) => (
                              <div key={tx.id} className="bg-white p-4 rounded-3xl w-full flex items-center justify-between shadow-sm">
                                  <div className="flex items-center gap-4">
                                      <div className={cn(
                                          "w-10 h-10 rounded-full flex items-center justify-center",
                                          tx.type === 'subscription' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-[#F97316]"
                                      )}>
                                          {tx.type === 'subscription' ? <Crown className="h-5 w-5" /> : <RocketIcon className="h-5 w-5" />}
                                      </div>
                                      <div>
                                          <p className="font-bold text-gray-900 text-sm max-w-[150px] truncate">{tx.description}</p>
                                          <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                                  <span className="font-bold text-gray-900">RD$ {tx.amount}</span>
                              </div>
                           ))}
                       </div>
                   </div>
                </div>
            );

          case 'notifications':
            return (
                <div className="fixed inset-0 z-[1000] bg-gray-50 flex flex-col animate-fade-in overflow-y-auto">
                   <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between pt-12">
                      <div className="flex items-center gap-3">
                         <Button variant="ghost" size="icon" onClick={() => setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button>
                         <h1 className="text-lg font-bold">Notificaciones</h1>
                      </div>
                   </div>
                   <div className="p-5 space-y-6 pb-24">
                       <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
                           <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                   <h4 className="font-bold text-gray-900 text-sm">Notificaciones Push</h4>
                                   <p className="text-xs text-gray-500">Recibe alertas en tu dispositivo</p>
                               </div>
                               <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
                           </div>
                           <div className="h-px bg-gray-50" />
                           <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                   <h4 className="font-bold text-gray-900 text-sm">Correos electrónicos</h4>
                                   <p className="text-xs text-gray-500">Resumen semanal y ofertas</p>
                               </div>
                               <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                           </div>
                       </div>
                   </div>
                </div>
            );

          case 'change-password':
            return (
                <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-fade-in overflow-y-auto">
                   <div className="p-4 flex items-center gap-3 pt-12">
                       <Button variant="ghost" size="icon" onClick={() => setView('account-settings')}><ArrowLeft className="h-6 w-6" /></Button>
                       <h1 className="text-xl font-bold">Cambiar Contraseña</h1>
                   </div>
                   <div className="p-6 space-y-6">
                       <div className="flex justify-center mb-6"><div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center"><Lock className="h-10 w-10 text-blue-500" /></div></div>
                       <div className="space-y-4">
                           <div className="space-y-2">
                               <Label>Nueva Contraseña</Label>
                               <Input type="password" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white" />
                           </div>
                       </div>
                       <div className="pt-4">
                           <Button onClick={handleUpdatePassword} disabled={passwordLoading || !newPassword} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200">
                                {passwordLoading ? <Loader2 className="animate-spin" /> : "Actualizar Contraseña"}
                           </Button>
                       </div>
                   </div>
                </div>
            );

          case 'account-settings':
            return (
              <div className="fixed inset-0 z-[1000] bg-gray-50 flex flex-col animate-fade-in overflow-y-auto">
                 <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between pt-12">
                    <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Administrar Cuenta</h1></div>
                 </div>
                 <div className="p-5 space-y-6 pb-24">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Seguridad</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button onClick={() => setView('change-password')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Lock className="h-5 w-5" /></div><span className="font-semibold text-gray-700">Cambiar Contraseña</span></div><ChevronRight className="h-5 w-5 text-gray-300" /></button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Información Legal</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                            <button onClick={() => navigate('/terms')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-4"><div className="p-2 bg-orange-50 text-[#F97316] rounded-xl"><FileText className="h-5 w-5" /></div><span className="font-semibold text-gray-700">Términos y Condiciones</span></div><ChevronRight className="h-5 w-5 text-gray-300" /></button>
                             <button onClick={() => navigate('/privacy')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Shield className="h-5 w-5" /></div><span className="font-semibold text-gray-700">Política de Privacidad</span></div><ChevronRight className="h-5 w-5 text-gray-300" /></button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Sesión</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                            <button onClick={handleSignOut} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-4"><div className="p-2 bg-gray-100 text-gray-600 rounded-xl"><LogOut className="h-5 w-5" /></div><span className="font-semibold text-gray-700">Cerrar Sesión</span></div></button>
                             <button onClick={() => setShowDeleteAccountDialog(true)} className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group"><div className="flex items-center gap-4"><div className="p-2 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-100 transition-colors"><Trash2 className="h-5 w-5" /></div><span className="font-semibold text-red-600">Eliminar mi cuenta</span></div></button>
                        </div>
                    </div>
                 </div>
              </div>
            );

          case 'verification':
            return (
                <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-fade-in overflow-y-auto">
                   <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between pt-12">
                      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Verificación</h1></div>
                   </div>
                   <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                       <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4 border-2 border-orange-100 relative"><ShieldCheck className="h-10 w-10 text-[#F97316]" /><div className="absolute -bottom-1 -right-1 bg-[#F97316] text-white p-1.5 rounded-full border-2 border-white"><Hammer className="h-4 w-4" /></div></div>
                       <div className="space-y-2 max-w-xs mx-auto"><h2 className="text-2xl font-bold text-gray-900">¡Próximamente!</h2><p className="text-gray-500 text-sm leading-relaxed">Estamos finalizando los detalles de nuestro sistema de verificación segura con IA.</p></div>
                       <Button onClick={() => setView('dashboard')} className="w-full max-w-sm bg-[#F97316] hover:bg-orange-600 rounded-xl h-12 shadow-lg shadow-orange-100">Entendido</Button>
                   </div>
                </div>
            );

          case 'metrics':
            return (
                <div className="fixed inset-0 z-[1000] bg-gray-50 flex flex-col animate-fade-in overflow-y-auto">
                   <div className="bg-white p-4 shadow-sm sticky top-0 z-10 space-y-4 pt-12">
                      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Métricas de Rendimiento</h1></div>
                      <div className="flex justify-between items-center bg-gray-100 p-1 rounded-lg">
                          {['24h', '7d', '30d', 'Año', 'Todo'].map((r) => {
                              const val = r === 'Año' ? '1y' : r === 'Todo' ? 'all' : r;
                              return (<button key={r} onClick={() => setMetricsTimeRange(val)} className={cn("flex-1 py-1.5 text-xs font-semibold rounded-md transition-all", metricsTimeRange === val ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>{r}</button>)
                          })}
                      </div>
                   </div>
                   <div className="p-4 space-y-6 pb-24">
                       {loadingMetrics ? (<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-gray-300" /></div>) : (
                           <>
                               <div className="grid grid-cols-2 gap-4">
                                   <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1"><div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider"><Eye className="h-3 w-3" /> Vistas Totales</div><p className="text-2xl font-black text-gray-900">{totalViews}</p></div>
                                   <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1"><div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider"><MousePointerClick className="h-3 w-3" /> Contactos</div><p className="text-2xl font-black text-gray-900">{totalClicks}</p></div>
                               </div>
                               <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                   <h3 className="font-bold text-gray-900 mb-6">Actividad</h3>
                                   <div className="h-64 w-full">
                                       <ResponsiveContainer width="100%" height="100%">
                                           <AreaChart data={metricsData}>
                                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                                               <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                                               <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)'}} />
                                               <Area type="monotone" dataKey="views" stroke="#F97316" strokeWidth={3} fillOpacity={0.1} fill="#F97316" />
                                               <Area type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={3} fillOpacity={0.1} fill="#3B82F6" />
                                           </AreaChart>
                                       </ResponsiveContainer>
                                   </div>
                               </div>
                               <div className="space-y-4">
                                   <div className="flex items-center justify-between px-2"><h3 className="font-bold text-gray-900">Últimas visitas</h3>{isPlus ? (<span className="text-xs text-[#0239c7] font-bold bg-blue-50 px-2 py-1 rounded-full">PLAN PLUS</span>) : (<Lock className="h-4 w-4 text-gray-400" />)}</div>
                                   {isPlus ? (
                                       recentViewers.length > 0 ? (
                                           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">{recentViewers.map((viewer: any, idx) => (<div key={idx} className="flex items-center gap-3 p-4"><Avatar className="h-10 w-10"><AvatarImage src={viewer.avatar_url} /><AvatarFallback>{viewer.first_name?.[0]}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><p className="font-bold text-sm text-gray-900 truncate">{viewer.first_name} {viewer.last_name}</p><p className="text-xs text-gray-400">Visitó tu perfil</p></div><span className="text-[10px] text-gray-400">{new Date(viewer.visited_at).toLocaleDateString()}</span></div>))}</div>
                                       ) : (<div className="text-center py-8 bg-white rounded-3xl border border-dashed border-gray-200">No hay visitas recientes.</div>)
                                   ) : (
                                       <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center overflow-hidden"><div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6"><Lock className="h-6 w-6 text-gray-400 mb-2" /><h3 className="font-bold text-gray-900 mb-1">Función Plus</h3><p className="text-sm text-gray-500 mb-4">Descubre quién visita tu perfil.</p><Button onClick={() => setView('serviapp-plus')} className="bg-[#0239c7] hover:bg-[#022b9e] text-white rounded-xl">Desbloquear</Button></div><div className="opacity-30 blur-sm pointer-events-none space-y-4">{[1,2,3].map(i => (<div key={i} className="flex items-center gap-3"><div className="h-10 w-10 bg-gray-200 rounded-full" /><div className="flex-1 space-y-2"><div className="h-3 w-24 bg-gray-200 rounded" /><div className="h-2 w-16 bg-gray-100 rounded" /></div></div>))}</div></div>
                                   )}
                               </div>
                           </>
                       )}
                   </div>
                </div>
            );

          case 'reputation':
            return (
              <div className="fixed inset-0 z-[1000] bg-gray-50 flex flex-col animate-fade-in overflow-y-auto">
                <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between pt-12">
                   <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Reputación</h1></div>
                </div>
                <div className="p-5 space-y-6 pb-24">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center"><div className="text-5xl font-black text-[#0F172A] mb-1">{averageRating.toFixed(1)}</div><div className="flex gap-1 mb-2">{[1,2,3,4,5].map((star) => (<Star key={star} className={cn("h-5 w-5", star <= Math.round(averageRating) ? "fill-[#F97316] text-[#F97316]" : "text-gray-200 fill-gray-100")} />))}</div><p className="text-gray-400 text-sm font-medium">{reviews.length} reseñas recibidas</p></div>
                    <div className="space-y-4"><h3 className="font-bold text-gray-900">Comentarios recientes</h3>{reviews.length === 0 ? <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-dashed">Aún no tienes reseñas.</div> : (reviews.map((r, i) => (<div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"><div className="flex justify-between items-start mb-2"><div className="flex gap-1">{[...Array(5)].map((_, i) => (<Star key={i} className={cn("h-3 w-3", i < r.rating ? "fill-[#F97316] text-[#F97316]" : "text-gray-200")} />))}</div><span className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span></div><p className="text-gray-700 text-sm">"{r.comment}"</p></div>)))}</div>
                </div>
              </div>
            );

          case 'edit':
            return (
              <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-fade-in overflow-y-auto">
                <div className="flex items-center gap-4 p-4 sticky top-0 bg-white z-10 pt-12"><Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="-ml-2"><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Mis datos personales</h1></div>
                <div className="pb-32 px-6 pt-4">
                    <div className="flex flex-col items-center mb-10"><div className="relative group"><div className="p-1.5 rounded-full border-2 border-dashed border-gray-200" style={{ borderColor: profileColor }}><ProfileAvatar size="xl" className="border-4 border-white shadow-sm" /></div><label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-[#F97316] p-2.5 rounded-full cursor-pointer shadow-lg border-2 border-white">{uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Camera className="h-4 w-4 text-white" />}</label><input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploadingAvatar} /></div><div className="mt-6 w-full max-w-xs"><p className="text-xs font-bold text-gray-400 text-center uppercase mb-3">Color de Portada</p><div className="flex gap-3 overflow-x-auto p-2 no-scrollbar justify-center">{PROFILE_COLORS.map((color) => (<button key={color.value} onClick={() => setProfileColor(color.value)} className={cn("w-8 h-8 rounded-full transition-all shadow-sm flex-shrink-0 border-2 border-white ring-1 ring-gray-100", profileColor === color.value ? "scale-110 ring-2 ring-offset-2 ring-gray-900 z-10" : "hover:scale-105")} style={{ backgroundColor: color.value }} />))}</div></div></div>
                    <div className="space-y-8"><div className="space-y-5"><h3 className="text-lg font-bold">¿Cómo te llamas?</h3><div className="space-y-5"><div className="relative"><label className="absolute -top-2.5 left-4 bg-white px-1.5 text-xs font-medium text-gray-500 z-10">Nombre(s)*</label><Input value={firstName} onChange={e => setFirstName(e.target.value)} className="h-14 rounded-xl border-gray-300" /></div><div className="relative"><label className="absolute -top-2.5 left-4 bg-white px-1.5 text-xs font-medium text-gray-500 z-10">Apellido(s)*</label><Input value={lastName} onChange={e => setLastName(e.target.value)} className="h-14 rounded-xl border-gray-300" /></div></div></div><div className="space-y-5"><h3 className="text-lg font-bold">Contacto y Ubicación</h3><div className="relative"><label className="absolute -top-2.5 left-4 bg-white px-1.5 text-xs font-medium text-gray-500 z-10">Teléfono móvil</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><Input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="h-14 pl-12 rounded-xl border-gray-300" /></div></div><div className="relative"><label className="absolute -top-2.5 left-4 bg-white px-1.5 text-xs font-medium text-gray-500 z-10">Provincia</label><Select value={city} onValueChange={setCity}><SelectTrigger className="h-14 rounded-xl border-gray-300"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent className="bg-white max-h-[250px] z-[1100]"><ScrollArea className="h-64">{DR_PROVINCES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</ScrollArea></SelectContent></Select></div></div></div>
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t pb-safe z-20"><Button onClick={updateProfile} disabled={updating} className="w-full h-12 rounded-full bg-[#F97316] font-bold text-lg">{updating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar datos"}</Button></div>
              </div>
            );

          case 'my-services':
            return (
              <div className="fixed inset-0 z-[1000] bg-gray-50 flex flex-col animate-fade-in overflow-y-auto">
                <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between pt-12"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={()=>setView('dashboard')}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Mis Publicaciones</h1></div></div>
                <div className="p-4 space-y-4 pb-24">
                   <div className="flex items-center justify-between px-1"><span className="text-sm font-medium text-gray-500">Espacios utilizados</span><span className="text-sm font-bold text-gray-900">{myServices.length} / {maxSlots}</span></div>
                   {Array.from({ length: TOTAL_DISPLAY_SLOTS }).map((_, index) => {
                     const s = myServices[index];
                     const isPlusSlot = index >= SLOT_LIMIT_FREE; 
                     const isLocked = isPlusSlot && !isPlus;

                     if (s) {
                       const isPromoted = s.is_promoted && s.promoted_until && new Date(s.promoted_until) > new Date();
                       return (
                         <div key={s.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 group relative">
                           {isPromoted && (<div className="absolute top-3 left-3 bg-[#F97316] text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1 shadow-lg shadow-orange-500/20"><Crown className="h-3 w-3 fill-white" /> DESTACADO</div>)}
                           {isPlusSlot && (<div className="absolute top-3 right-3 bg-[#0239c7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm border border-white/20">PLUS SLOT</div>)}
                           <div className="w-full h-48 bg-gray-100"><img src={s.image_url || "/placeholder.svg"} className="w-full h-full object-cover cursor-pointer" onClick={()=>navigate(`/service/${s.id}`)}/></div>
                           <div className="p-5">
                               <div className="flex justify-between items-start mb-3"><h3 className="font-bold text-gray-900 text-lg flex-1 mr-4 truncate">{s.title}</h3><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="rounded-xl w-48 p-2 z-[1100]"><DropdownMenuItem onClick={()=>navigate(`/service/${s.id}`)} className="rounded-lg h-10"><Check className="mr-2 h-4 w-4" /> Ver detalle</DropdownMenuItem><DropdownMenuItem onClick={()=>handleEditService(s.id)} className="rounded-lg h-10"><Edit2 className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem><DropdownMenuItem className="text-red-600 rounded-lg h-10" onClick={()=>handleClickDelete(s)}><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
                               <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5"><CalendarRange className="h-3.5 w-3.5" /> Publicado el {new Date(s.created_at).toLocaleDateString()}</div>
                               <div className="flex items-center gap-3">
                                  {!isPromoted ? (
                                    <Button onClick={() => {setSelectedServiceToBoost(s);setSelectedBoostOption(72);setBoostModalOpen(true);}} className="flex-1 bg-gray-900 text-white h-11 rounded-xl text-sm font-bold"><TrendingUp className="h-4 w-4 mr-2 text-yellow-400" /> Impulsar</Button>
                                  ) : (<div className="flex-1 bg-orange-50 border border-orange-100 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-[#F97316]"><Clock className="h-4 w-4 mr-2" /> Destacado Activo</div>)}
                               </div>
                           </div>
                         </div>
                       );
                     } else if (isLocked) {
                        return (
                           <div key={`locked-${index}`} onClick={() => setView('serviapp-plus')} className="h-32 rounded-3xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden group">
                               <div className="absolute inset-0 bg-white/40 group-hover:bg-white/0 transition-colors" />
                               <div className="absolute top-3 right-3"><Lock className="h-4 w-4 text-gray-400" /></div>
                               <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                   <Crown className="h-5 w-5 text-gray-500" />
                               </div>
                               <span className="text-sm font-bold text-gray-500">Espacio Exclusivo Plus</span>
                               <span className="text-xs text-[#0239c7] font-semibold group-hover:underline">Mejorar a Plus</span>
                           </div>
                        );
                     } else {
                       return (
                           <div key={`empty-${index}`} onClick={() => navigate('/publish')} className={cn(
                               "h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative",
                               isPlusSlot 
                                ? "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
                                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                           )}>
                               {isPlusSlot && <div className="absolute top-3 right-3 bg-[#0239c7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">PLUS</div>}
                               <div className={cn("p-2 rounded-full", isPlusSlot ? "bg-blue-100 text-[#0239c7]" : "bg-white text-gray-400")}>
                                   <Plus className="h-6 w-6" />
                               </div>
                               <span className={cn("text-sm font-medium", isPlusSlot ? "text-[#0239c7]" : "text-gray-400")}>
                                   Crear nuevo servicio
                               </span>
                           </div>
                       );
                     }
                   })}
                </div>
              </div>
            );

          case 'favorites':
            return (
              <div className="fixed inset-0 z-[1000] bg-gray-50 flex flex-col animate-fade-in overflow-y-auto">
                <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between pt-12"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={handleBackToDashboard}><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Mis Favoritos</h1></div></div>
                <div className="p-4 pb-24">{myFavorites.length === 0 ? <div className="text-center py-10 text-gray-500">Sin favoritos</div> : (<div className="grid grid-cols-2 gap-4">{myFavorites.map((s) => <div key={s.id} onClick={()=>navigate(`/service/${s.id}`)}><ServiceCard title={s.title} price={`RD$ ${s.price}`} image={s.image_url} /></div>)}</div>)}</div>
              </div>
            );

          case 'preview':
            return (
              <div className="fixed inset-0 z-[1000] bg-gray-50 flex flex-col animate-fade-in overflow-y-auto">
                <div className="absolute top-0 left-0 right-0 h-72 rounded-b-[3rem] z-0" style={{ backgroundColor: profileColor }} />
                <div className="relative z-10 px-4 pt-12">
                  <div className="flex justify-between items-center text-white mb-2"><Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-white hover:bg-white/20"><ArrowLeft className="h-6 w-6" /></Button><h1 className="text-lg font-bold">Mi Perfil</h1><Button variant="ghost" size="icon" onClick={() => setView('edit')} className="text-white hover:bg-white/20"><Edit2 className="h-5 w-5" /></Button></div>
                  <div className="bg-white rounded-3xl shadow-xl p-6 text-center mt-24 space-y-4">
                    <div className="relative -mt-20 mb-4 flex justify-center"><div className="p-2 bg-white rounded-full"><ProfileAvatar size="xl" className="border-4 border-white" /></div></div>
                    <div className="flex flex-col items-center"><h2 className="text-2xl font-bold">{firstName} {lastName}</h2><p className="text-gray-500 text-sm">{session?.user.email}</p></div>
                    <div className="grid grid-cols-1 gap-4 pt-4 text-left border-t border-gray-50"><div className="flex gap-3"><Phone className="text-gray-400 h-4 w-4"/><span>{phone || "No agregado"}</span></div><div className="flex gap-3"><MapPin className="text-gray-400 h-4 w-4"/><span>{city || "No agregado"}</span></div></div>
                  </div>
                </div>
              </div>
            );

          default: // DASHBOARD
            return (
                <div className="min-h-screen bg-gray-50 pb-24 pt-12 animate-fade-in">
                  <div className="bg-white pt-4 pb-4 px-6 shadow-sm rounded-b-[2.5rem] relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex-1"><p className="text-gray-400 text-sm">Bienvenido,</p><div className="flex items-center gap-1.5"><h1 className="text-2xl font-bold truncate max-w-[200px]">{firstName || 'Usuario'}</h1>{isPlus && <Badge className="bg-[#0239c7] text-white text-[10px]"><Crown className="h-3 w-3 mr-1" />PLUS</Badge>}</div></div>
                      <div onClick={() => setView('preview')} className="cursor-pointer relative"><ProfileAvatar size="md" className={isPlus ? "border-2 border-[#0239c7]" : "border-2 border-orange-100"} />{isPlus && (<div className="absolute -bottom-1 -right-1 bg-[#0239c7] text-white p-0.5 rounded-full border-2 border-white"><Crown className="h-3 w-3 fill-white" /></div>)}</div>
                    </div>
                    <div className="flex justify-between gap-2 pb-2"><QuickAction icon={User} label="Perfil" onClick={() => setView('preview')} /><QuickAction icon={Star} label="Reputación" onClick={handleOpenReputation} /><QuickAction icon={Crown} label="ServiAPP Plus" onClick={() => setView('serviapp-plus')} /><QuickAction icon={HelpCircle} label="Ayuda" onClick={() => setView('help')} /></div>
                  </div>
                  <div className="px-5 space-y-6 mt-6">
                    {completedSteps < totalSteps && (<div className="bg-white rounded-2xl p-5 border border-orange-100"><div className="mb-2"><h3 className="font-bold">Completa tu perfil</h3><p className="text-sm text-gray-500">{completedSteps}/{totalSteps} pasos</p></div><Progress value={(completedSteps/totalSteps)*100} className="h-2 mb-3" /><Button onClick={()=>setView('edit')} className="w-full bg-[#F97316] h-9 text-sm">Terminar</Button></div>)}
                    <div className="space-y-6">
                      <MenuSection title="Mis Servicios"><MenuItem icon={Briefcase} label="Mis Publicaciones" onClick={handleOpenMyServices} /><MenuItem icon={Heart} label="Mis Favoritos" badge={myFavorites.length > 0 ? String(myFavorites.length) : undefined} onClick={() => handleOpenFavorites()} /></MenuSection>
                      <MenuSection title="Estadísticas & Verificación"><MenuItem icon={BarChart3} label="Métricas" onClick={() => setView('metrics')} /><MenuItem icon={ShieldCheck} label="Verificación" onClick={() => setView('verification')} /><MenuItem icon={Bell} label="Notificaciones" onClick={() => setView('notifications')} /></MenuSection>
                      <MenuSection title="Suscripción"><MenuItem icon={CreditCard} label="Mi Plan" onClick={() => setView('my-plan')} /></MenuSection>
                      <MenuSection title="Preferencias"><MenuItem icon={Settings} label="Administrar Cuenta" onClick={() => setView('account-settings')} /></MenuSection>
                    </div>
                  </div>
                </div>
            );
      }
  };

  return (
    <>
      {renderCurrentView()}

      {showPlusSuccess && <PlusSuccessOverlay onClose={() => setShowPlusSuccess(false)} />}

      <Dialog open={boostModalOpen} onOpenChange={setBoostModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl z-[2000]">
            <DialogHeader className="space-y-3 pb-2"><div className="mx-auto bg-gradient-to-br from-[#F97316] to-pink-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"><RocketIcon className="h-7 w-7 text-white" /></div><DialogTitle className="text-center text-xl font-bold">Impulsa tu publicación</DialogTitle><DialogDescription className="text-center text-gray-500">Elige un plan para destacar tu servicio.</DialogDescription></DialogHeader>
            <div className="flex flex-col gap-3 py-4">{BOOST_OPTIONS.map((opt) => (<div key={opt.duration} onClick={() => setSelectedBoostOption(opt.duration)} className={cn("cursor-pointer rounded-2xl border-2 p-4 flex items-center justify-between transition-all", selectedBoostOption === opt.duration ? "border-[#F97316] bg-orange-50/50 shadow-md" : "border-gray-100 bg-white hover:border-orange-100")}><div className="flex items-center gap-3"><div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedBoostOption === opt.duration ? "border-[#F97316]" : "border-gray-300")}>{selectedBoostOption === opt.duration && <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}</div><div><h3 className="font-bold text-gray-900">{opt.label}</h3><p className="text-xs text-gray-400">Visibilidad Premium</p></div></div><div className="text-right"><p className="text-[#F97316] font-black text-lg">RD$ {opt.price}</p></div></div>))}</div>
            <Button onClick={handleProcessBoost} disabled={!selectedBoostOption || processingBoost} className="w-full h-12 text-lg font-bold bg-[#F97316] hover:bg-orange-600 rounded-xl shadow-lg">{processingBoost ? <Loader2 className="animate-spin" /> : "Pagar y Activar"}</Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showBoostDeleteWarning} onOpenChange={setShowBoostDeleteWarning}>
        <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto z-[2000]">
          <AlertDialogHeader className="text-center"><div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-2"><AlertTriangle className="h-6 w-6 text-red-600" /></div><AlertDialogTitle className="text-xl font-bold text-red-600">¡Servicio Destacado!</AlertDialogTitle><AlertDialogDescription className="text-center text-gray-600 mt-2">Este servicio tiene un Boost activo. Si lo eliminas perderás la inversión y el tiempo restante.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setShowBoostDeleteWarning(false)} className="w-full rounded-xl mt-2">Cancelar</AlertDialogCancel><AlertDialogAction disabled={deleteTimer > 0} onClick={() => handleConfirmDelete(serviceToDelete)} className="w-full bg-red-600 hover:bg-red-700 rounded-xl font-bold h-12">{deleteTimer > 0 ? `Espera ${deleteTimer}s...` : "Sí, eliminar"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto z-[2000]">
          <AlertDialogHeader>
            {isPlus ? (
              <>
                <div className="mx-auto bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck className="h-6 w-6 text-[#0239c7]" />
                </div>
                <AlertDialogTitle className="text-center text-gray-900">Acción requerida</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-gray-600">
                    Tienes una suscripción **Plus** activa. Debes cancelar tu plan antes de poder eliminar tu cuenta. 
                    <br/><br/>
                    Si cancelas el plan y eliminas la cuenta, perderás acceso a todas las funcionalidades Plus de forma inmediata.
                </AlertDialogDescription>
              </>
            ) : (
              <>
                <AlertDialogTitle className="text-red-600">¿Borrar cuenta?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción eliminará permanentemente todos tus datos de ServiAPP. No podrás recuperar tus anuncios ni reseñas.
                </AlertDialogDescription>
              </>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl">Cancelar</AlertDialogCancel>
            {!isPlus && (
               <AlertDialogAction disabled={isDeleting} onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 rounded-xl">
                    {isDeleting ? <Loader2 className="animate-spin" /> : "Sí, eliminar"}
               </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const MenuSection = ({ title, children }: any) => (<div><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">{title}</h3><div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">{children}</div></div>);
const QuickAction = ({ icon: Icon, label, onClick }: any) => (<button onClick={onClick} className="flex flex-col items-center gap-2 group flex-1"><div className="w-14 h-14 bg-orange-50/80 group-hover:bg-[#F97316] rounded-2xl flex items-center justify-center transition-all shadow-sm border border-orange-100/50"><Icon className="h-6 w-6 text-[#F97316] group-hover:text-white transition-colors" strokeWidth={2} /></div><span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#F97316]">{label}</span></button>);
const MenuItem = ({ icon: Icon, label, onClick, isDestructive, badge }: any) => (<button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-orange-50/30 transition-colors group relative"><div className="flex items-center gap-4"><div className={`p-2 rounded-xl ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-orange-50/50 text-[#F97316]'} transition-all`}><Icon className="h-5 w-5" strokeWidth={2} /></div><span className={`font-semibold text-sm ${isDestructive ? 'text-red-500' : 'text-gray-700'}`}>{label}</span></div><div className="flex items-center gap-3">{badge && (<span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${badge === "!" ? "bg-red-500 animate-pulse" : "bg-[#F97316]"}`}>{badge}</span>)}<ChevronRight className="h-4 w-4 text-gray-300" /></div></button>);

export default Profile;