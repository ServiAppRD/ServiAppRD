import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { 
  Loader2, LogOut, User, Phone, MapPin, Heart, 
  HelpCircle, ChevronRight, CreditCard, Gift, 
  ArrowLeft, Bell, Shield, Settings, CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DR_CITIES = [
  "Santo Domingo", "Santiago de los Caballeros", "San Francisco de Macorís", 
  "Higüey", "La Romana", "San Cristóbal", "San Pedro de Macorís", 
  "La Vega", "Puerto Plata", "Barahona", "Punta Cana", "Bávaro"
];

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
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [updating, setUpdating] = useState(false);

  // Completion Logic
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

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

  const calculateCompletion = (data: any) => {
    const fields = [
      { key: 'first_name', label: 'Nombre' },
      { key: 'last_name', label: 'Apellido' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'city', label: 'Ciudad' }
    ];
    
    const completed = fields.filter(f => data[f.key] && data[f.key].trim() !== '').length;
    const total = fields.length;
    const percent = Math.round((completed / total) * 100);
    
    setCompletionPercentage(percent);

    const missing = fields.filter(f => !data[f.key] || data[f.key].trim() === '').map(f => f.label);
    setMissingFields(missing);
  };

  const getProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, city, address')
        .eq('id', userId)
        .single();

      if (error) console.error('Error fetching profile:', error);

      if (data) {
        setProfileData(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setAddress(data.address || "");
        calculateCompletion(data);
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
      const updates = {
        id: session?.user.id,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        city: city,
        address: address,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      showSuccess("Perfil actualizado correctamente");
      setProfileData(updates);
      calculateCompletion(updates);
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
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="hover:bg-orange-50 hover:text-[#F97316]">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold">Editar Perfil</h1>
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
            
            <div className="pt-2 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Información de Contacto</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono / Celular</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                            id="phone" 
                            type="tel"
                            placeholder="809-555-5555"
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            className="pl-10 focus-visible:ring-[#F97316]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">Ciudad (Rep. Dom.)</Label>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="focus:ring-[#F97316]">
                                <SelectValue placeholder="Selecciona tu ciudad" />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-50">
                                {DR_CITIES.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección (Sector, calle, #)</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                            id="address" 
                            placeholder="Ej. Naco, Calle 5, #20"
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            className="pl-10 focus-visible:ring-[#F97316]"
                            />
                        </div>
                    </div>
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
      <div className="bg-white pt-4 pb-4 px-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-b-[2.5rem] relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-400 text-sm font-medium">Bienvenido de nuevo,</p>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight truncate max-w-[200px]">
              {profileData?.first_name || 'Usuario'}
            </h1>
            {profileData?.city && (
                <div className="flex items-center text-xs text-gray-400 mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profileData.city}
                </div>
            )}
          </div>
          <Avatar className="h-12 w-12 border-2 border-orange-100 shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-[#F97316] transition-all" onClick={() => setView('edit')}>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user.email}`} />
            <AvatarFallback className="bg-orange-100 text-[#F97316] font-bold">
              {profileData?.first_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Quick Actions inside Header */}
        <div className="flex justify-between gap-2 pb-2">
          <QuickAction 
            icon={User} 
            label="Perfil" 
            onClick={() => setView('edit')} 
          />
          <QuickAction icon={Gift} label="Cupones" />
          <QuickAction icon={MapPin} label="Dirección" onClick={() => setView('edit')} />
          <QuickAction icon={HelpCircle} label="Ayuda" />
        </div>
      </div>

      <div className="px-5 space-y-6 mt-6">

        {/* Profile Completion Card - Logic Applied */}
        {completionPercentage < 100 && (
            <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-2 -mt-2 z-0"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="font-bold text-[#0F172A]">Completa tu perfil</h3>
                    <p className="text-xs text-gray-500 font-medium">{completionPercentage}% completado</p>
                </div>
                <Button 
                    variant="ghost" 
                    onClick={() => setView('edit')}
                    className="text-[#F97316] hover:text-orange-700 hover:bg-orange-50 h-8 px-3 rounded-full font-bold text-xs"
                >
                    Completar
                </Button>
                </div>
                <Progress value={completionPercentage} className="h-2.5 bg-gray-100" indicatorClassName="bg-gradient-to-r from-[#F97316] to-orange-500 rounded-full" />
                <div className="mt-3 flex flex-wrap gap-2">
                    {missingFields.map(field => (
                        <p key={field} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full flex items-center inline-flex">
                            <span className="w-1 h-1 rounded-full bg-[#F97316] mr-1.5"></span>
                            Falta {field.toLowerCase()}
                        </p>
                    ))}
                </div>
            </div>
            </div>
        )}
        
        {/* Fully Completed Badge */}
        {completionPercentage === 100 && (
             <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                    <h3 className="font-bold text-green-700 text-sm">¡Perfil Completado!</h3>
                    <p className="text-xs text-green-600">Tienes acceso total a todas las funciones.</p>
                </div>
             </div>
        )}

        {/* Menu Sections */}
        <div className="space-y-6">
          <MenuSection title="Mi Cuenta">
            <MenuItem icon={Heart} label="Mis Favoritos" badge="3" />
            <MenuItem icon={CreditCard} label="Métodos de Pago" />
            <MenuItem icon={Bell} label="Notificaciones" />
          </MenuSection>

          <MenuSection title="Preferencias">
            <MenuItem icon={Settings} label="Configuración" onClick={() => setView('edit')} />
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