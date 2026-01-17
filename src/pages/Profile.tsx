import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { 
  Loader2, LogOut, User, Phone, MapPin, Heart, 
  HelpCircle, ChevronRight, CreditCard, Gift, 
  ArrowLeft, Bell, Shield, Settings
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'edit'>('dashboard');
  const [session, setSession] = useState<any>(null);
  
  // Profile Data
  const [profileData, setProfileData] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      } else {
        getProfile(session.user.id);
      }
    });
  }, [navigate]);

  const getProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('id', userId)
        .single();

      if (error) console.error('Error fetching profile:', error);

      if (data) {
        setProfileData(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session?.user.id,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      showSuccess("Perfil actualizado correctamente");
      setProfileData({ ...profileData, first_name: firstName, last_name: lastName, phone: phone });
      setView('dashboard'); // Go back to dashboard
    } catch (error: any) {
      showError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  // --- EDIT PROFILE VIEW ---
  if (view === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="hover:bg-orange-50 hover:text-[#F97316]">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold">Información Personal</h1>
        </div>
        
        <div className="p-6 max-w-md mx-auto space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className="focus-visible:ring-[#F97316]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input 
                id="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="focus-visible:ring-[#F97316]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="pl-10 focus-visible:ring-[#F97316]"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={updateProfile} 
            disabled={updating}
            className="w-full bg-[#F97316] hover:bg-orange-600 text-white shadow-md hover:shadow-orange-200 transition-all h-12 rounded-xl text-base font-semibold"
          >
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-safe animate-fade-in">
      {/* Modern Orange Header */}
      <div className="bg-white pt-4 pb-2 px-6 sticky top-0 z-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-b-[2rem]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-400 text-sm font-medium">Bienvenido de nuevo,</p>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {profileData?.first_name || 'Usuario'}
            </h1>
          </div>
          <Avatar className="h-12 w-12 border-2 border-orange-100 shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-[#F97316] transition-all">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user.email}`} />
            <AvatarFallback className="bg-orange-100 text-[#F97316] font-bold">
              {profileData?.first_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Quick Actions inside Header for integration */}
        <div className="flex justify-between gap-2 pb-2">
          <QuickAction 
            icon={User} 
            label="Perfil" 
            onClick={() => setView('edit')} 
          />
          <QuickAction icon={Gift} label="Cupones" />
          <QuickAction icon={MapPin} label="Dirección" />
          <QuickAction icon={HelpCircle} label="Ayuda" />
        </div>
      </div>

      <div className="px-5 space-y-6 mt-6">

        {/* Profile Completion Card */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-2 -mt-2 z-0"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-[#0F172A]">Completa tu perfil</h3>
                <p className="text-xs text-gray-500 font-medium">2 de 4 pasos completados</p>
              </div>
              <Button variant="ghost" className="text-[#F97316] hover:text-orange-700 hover:bg-orange-50 h-8 px-3 rounded-full font-bold text-xs">
                Completar
              </Button>
            </div>
            <Progress value={50} className="h-2.5 bg-gray-100" indicatorClassName="bg-gradient-to-r from-[#F97316] to-orange-500 rounded-full" />
            <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
              Agrega una descripción para atraer más clientes
            </p>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-6">
          <MenuSection title="Mi Cuenta">
            <MenuItem icon={Heart} label="Mis Favoritos" badge="3" />
            <MenuItem icon={CreditCard} label="Métodos de Pago" />
            <MenuItem icon={Bell} label="Notificaciones" />
          </MenuSection>

          <MenuSection title="Preferencias">
            <MenuItem icon={Settings} label="Configuración" />
            <MenuItem icon={Shield} label="Privacidad y Seguridad" />
            <MenuItem icon={LogOut} label="Cerrar Sesión" onClick={handleSignOut} isDestructive />
          </MenuSection>
        </div>

      </div>
    </div>
  );
};

// --- Components ---

const MenuSection = ({ title, children }: any) => (
  <div>
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
      {title}
    </h3>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
      {children}
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 group flex-1"
  >
    <div className="w-14 h-14 bg-orange-50/80 group-hover:bg-[#F97316] group-active:scale-95 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border border-orange-100/50">
      <Icon className="h-6 w-6 text-[#F97316] group-hover:text-white transition-colors" strokeWidth={2} />
    </div>
    <span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#F97316] transition-colors">
      {label}
    </span>
  </button>
);

const MenuItem = ({ icon: Icon, label, onClick, isDestructive, badge }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-orange-50/30 transition-colors group relative"
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-orange-50/50 text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white'} transition-all duration-300`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <span className={`font-semibold text-sm ${isDestructive ? 'text-red-500' : 'text-gray-700'}`}>
        {label}
      </span>
    </div>
    <div className="flex items-center gap-3">
      {badge && (
        <span className="bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-orange-200">
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#F97316] transition-colors" />
    </div>
  </button>
);

export default Profile;