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
  ArrowLeft
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
          <Button variant="ghost" size="icon" onClick={() => setView('dashboard')}>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input 
                id="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
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
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={updateProfile} 
            disabled={updating}
            className="w-full bg-[#F97316] hover:bg-orange-600 text-white"
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
    <div className="min-h-screen bg-white pb-24 pt-safe animate-fade-in">
      {/* Header */}
      <div className="px-4 py-4 flex justify-between items-center bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          ¡Hola, {profileData?.first_name || 'Usuario'}!
        </h1>
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user.email}`} />
          <AvatarFallback className="bg-orange-100 text-[#F97316]">
            {profileData?.first_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="px-4 space-y-6">
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-3">
          <QuickAction 
            icon={User} 
            label="Información" 
            subLabel="personal" 
            onClick={() => setView('edit')} 
          />
          <QuickAction icon={Gift} label="Mis" subLabel="Cupones" />
          <QuickAction icon={MapPin} label="Mis" subLabel="Direcciones" />
          <QuickAction icon={HelpCircle} label="Ayuda" subLabel="Soporte" />
        </div>

        {/* Profile Completion Card */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-bold text-[#0F172A]">Completa tu perfil</h3>
              <p className="text-xs text-gray-500">2 de 4 pasos completados</p>
            </div>
            <Button variant="ghost" className="text-[#F97316] hover:text-orange-700 h-auto p-0 font-semibold text-sm hover:bg-transparent">
              Completar
            </Button>
          </div>
          <Progress value={50} className="h-2 bg-gray-200" indicatorClassName="bg-[#0F172A]" />
          <p className="text-[10px] text-gray-400 mt-2">
            Describe qué servicios ofreces para atraer más clientes.
          </p>
        </div>

        {/* List Sections - Perfil */}
        <div>
          <h3 className="font-bold text-lg mb-2 text-[#0F172A]">Perfil</h3>
          <div className="space-y-1">
            <MenuItem icon={Heart} label="Favoritos" />
            <MenuItem icon={CreditCard} label="Métodos de pago" />
          </div>
        </div>

        {/* List Sections - Actividad */}
        <div>
          <h3 className="font-bold text-lg mb-2 text-[#0F172A]">Configuración</h3>
          <div className="space-y-1">
            <MenuItem icon={LogOut} label="Cerrar Sesión" onClick={handleSignOut} isDestructive />
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Components
const QuickAction = ({ icon: Icon, label, subLabel, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2"
  >
    <div className="w-full aspect-square bg-gray-50 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 active:scale-95 transition-transform">
      <Icon className="h-6 w-6 text-[#0F172A]" strokeWidth={1.5} />
    </div>
    <div className="text-center">
      <div className="text-[11px] font-medium leading-tight text-gray-700">{label}</div>
      {subLabel && <div className="text-[11px] font-medium leading-tight text-gray-700">{subLabel}</div>}
    </div>
  </button>
);

const MenuItem = ({ icon: Icon, label, onClick, isDestructive }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group"
  >
    <div className="flex items-center gap-4">
      <Icon className={`h-5 w-5 ${isDestructive ? 'text-red-500' : 'text-gray-600'}`} />
      <span className={`font-medium ${isDestructive ? 'text-red-600' : 'text-gray-700'}`}>{label}</span>
    </div>
    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
  </button>
);

export default Profile;