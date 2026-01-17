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
  ArrowLeft, Bell, Shield, Settings, Edit2, Mail, CheckCircle2, AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const DR_CITIES = [
  "Santo Domingo", "Santiago de los Caballeros", "San Francisco de Macorís", 
  "Higüey", "La Romana", "San Cristóbal", "San Pedro de Macorís", 
  "La Vega", "Puerto Plata", "Barahona", "Punta Cana", "Bávaro"
];

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'edit' | 'preview'>('dashboard');
  const [session, setSession] = useState<any>(null);
  
  // Profile Data
  const [profileData, setProfileData] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [updating, setUpdating] = useState(false);

  // Completion Logic (Steps)
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
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
      { key: 'city', label: 'Ciudad' },
      { key: 'address', label: 'Dirección' }
    ];
    
    const completed = fields.filter(f => {
      const value = data[f.key];
      return value && String(value).trim() !== '';
    }).length;

    setTotalSteps(fields.length);
    setCompletedSteps(completed);

    const missing = fields
      .filter(f => !data[f.key] || String(data[f.key]).trim() === '')
      .map(f => f.label);
    
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
      setView('preview'); // Ir a vista previa al guardar
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

  // --- PREVIEW PROFILE VIEW (Modern Card) ---
  if (view === 'preview') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in relative">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-[#F97316] to-orange-600 rounded-b-[3rem] z-0 shadow-lg" />
        
        <div className="relative z-10 px-4 pt-4">
          <div className="flex justify-between items-center text-white mb-2">
            <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-white hover:bg-white/20 hover:text-white rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-bold tracking-wide">Mi Perfil</h1>
            <Button variant="ghost" size="icon" onClick={() => setView('edit')} className="text-white hover:bg-white/20 hover:text-white rounded-full">
              <Edit2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Added mt-24 to push card down and prevent overlap */}
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center mt-24 space-y-4 border border-gray-100 relative">
            <div className="absolute -top-14 left-0 right-0 flex justify-center">
               <div className="p-1.5 bg-white rounded-full shadow-md">
                  <Avatar className="h-28 w-28 border-4 border-orange-50">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user.email}`} />
                    <AvatarFallback className="bg-orange-100 text-[#F97316] text-4xl font-bold">
                      {firstName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
               </div>
               {completedSteps === totalSteps && (
                 <div className="absolute bottom-1 right-[calc(50%-2.5rem)] bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Verificado">
                   <CheckCircle2 className="h-4 w-4" />
                 </div>
               )}
            </div>

            <div className="pt-12">
              <h2 className="text-2xl font-bold text-gray-900">{firstName} {lastName}</h2>
              <p className="text-gray-500 text-sm font-medium">{session?.user.email}</p>
            </div>

            <div className="flex justify-center gap-2 pt-1 pb-2">
               <Badge className="bg-orange-50 text-[#F97316] hover:bg-orange-100 border-0 px-3 py-1">Cliente</Badge>
               {city && <Badge variant="outline" className="text-gray-500 border-gray-200">{city}</Badge>}
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4 text-left border-t border-gray-50">
               <InfoItem icon={Phone} label="Teléfono" value={phone || "No agregado"} isMissing={!phone} />
               <InfoItem icon={MapPin} label="Dirección" value={address || "No agregada"} isMissing={!address} />
               <InfoItem icon={MapPin} label="Ciudad" value={city || "No seleccionada"} isMissing={!city} />
            </div>

            {completedSteps < totalSteps && (
              <Button onClick={() => setView('edit')} className="w-full mt-4 bg-orange-50 text-[#F97316] hover:bg-orange-100 border-0 font-bold h-12 rounded-xl">
                Completar información faltante
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- EDIT PROFILE VIEW ---
  if (view === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-safe animate-fade-in">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="hover:bg-orange-50 hover:text-[#F97316]">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-bold">Editar Información</h1>
          </div>
        </div>
        
        <div className="p-6 max-w-md mx-auto space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#F97316]" /> Contacto
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono / Celular</Label>
                        <Input 
                          id="phone" 
                          type="tel"
                          placeholder="809-555-5555"
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="focus-visible:ring-[#F97316]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="focus:ring-[#F97316]">
                                <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-50">
                                {DR_CITIES.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input 
                          id="address" 
                          placeholder="Ej. Sector, Calle, #"
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)} 
                          className="focus-visible:ring-[#F97316]"
                        />
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
      {/* Header */}
      <div className="bg-white pt-4 pb-4 px-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-b-[2.5rem] relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-gray-400 text-sm font-medium">Bienvenido,</p>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight truncate">
              {profileData?.first_name || 'Usuario'}
            </h1>
          </div>
          <Avatar className="h-12 w-12 border-2 border-orange-100 shadow-sm cursor-pointer hover:scale-105 transition-transform" onClick={() => setView('preview')}>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user.email}`} />
            <AvatarFallback className="bg-orange-100 text-[#F97316] font-bold">
              {profileData?.first_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-between gap-2 pb-2">
          <QuickAction 
            icon={User} 
            label="Perfil" 
            onClick={() => setView('preview')} 
          />
          <QuickAction icon={Gift} label="Cupones" />
          <QuickAction icon={MapPin} label="Dirección" onClick={() => setView('edit')} />
          <QuickAction icon={HelpCircle} label="Ayuda" />
        </div>
      </div>

      <div className="px-5 space-y-6 mt-6">

        {/* Profile Completion Card (Steps Logic) */}
        {completedSteps < totalSteps && (
            <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-bl-full -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-[#0F172A] text-lg">Completa tu perfil</h3>
                        <p className="text-sm text-gray-500 font-medium">
                          <span className="text-[#F97316] font-bold">{completedSteps}</span> de {totalSteps} pasos completados
                        </p>
                    </div>
                    <Button 
                        size="sm"
                        onClick={() => setView('edit')}
                        className="bg-[#F97316] hover:bg-orange-600 text-white rounded-full px-4 h-8 text-xs font-bold shadow-sm shadow-orange-200"
                    >
                        Continuar
                    </Button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-gradient-to-r from-[#F97316] to-orange-500 transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                    />
                  </div>

                  {/* Missing Fields List */}
                  <div className="space-y-2">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Falta completar:</p>
                      <div className="flex flex-col gap-2">
                          {missingFields.slice(0, 3).map((field, i) => (
                              <div key={i} className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center flex-shrink-0">
                                    <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
                                  </div>
                                  {field}
                              </div>
                          ))}
                          {missingFields.length > 3 && (
                            <p className="text-xs text-gray-400 pl-1">+ {missingFields.length - 3} más...</p>
                          )}
                      </div>
                  </div>
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

const InfoItem = ({ icon: Icon, label, value, isMissing }: any) => (
  <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
    <div className={`p-2 rounded-full ${isMissing ? 'bg-red-100 text-red-500' : 'bg-white text-orange-500'} shadow-sm`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className={`text-sm font-semibold ${isMissing ? 'text-red-500' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
    {isMissing && <AlertCircle className="h-4 w-4 text-red-400" />}
  </div>
);

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