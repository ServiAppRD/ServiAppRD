import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
import { showSuccess, showError } from "@/utils/toast";
import { 
  ArrowLeft, Check, ChevronRight, 
  DollarSign, Sparkles, UploadCloud, X, Loader2, Rocket, User, Zap,
  Facebook, Instagram, Globe, MapPin,
  Wrench, Droplets, Car, Hammer, Leaf, Laptop, Scissors, HardHat, Truck, GraduationCap, Heart, Calendar, MoreHorizontal, Crown,
  TrendingUp, CheckCircle2, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceCard } from "@/components/ServiceCard";

// Constantes de Datos con Iconos
const CATEGORIES = [
  { name: "Plomería", icon: Droplets },
  { name: "Electricidad", icon: Zap },
  { name: "Limpieza", icon: Sparkles },
  { name: "Mecánica", icon: Car },
  { name: "Carpintería", icon: Hammer },
  { name: "Jardinería", icon: Leaf },
  { name: "Tecnología", icon: Laptop },
  { name: "Belleza y Estética", icon: Scissors },
  { name: "Construcción", icon: HardHat },
  { name: "Transporte", icon: Truck },
  { name: "Educación", icon: GraduationCap },
  { name: "Salud y Bienestar", icon: Heart },
  { name: "Eventos", icon: Calendar },
  { name: "Otros Servicios", icon: MoreHorizontal }
];

const BOOST_PLANS = [
  { id: 'free', label: "Estándar", duration: 0, price: 0, popular: false },
  { 
    id: '1day', 
    label: "Boost 24 Horas", 
    duration: 24, 
    price: 99, 
    popular: false, 
    checkoutUrl: "https://serviapprdrd.lemonsqueezy.com/checkout/buy/e72507b2-8ba3-49bb-8eb2-5938935acefb?embed=1&media=0" 
  },
  { id: '3days', label: "Boost 3 Días", duration: 72, price: 499, popular: true },
  { id: '7days', label: "Boost 7 Días", duration: 168, price: 999, popular: false },
];

const DR_LOCATIONS: Record<string, string[]> = {
  "Distrito Nacional": [
    "Piantini", "Naco", "Gascue", "Ciudad Colonial", "Bella Vista", "Evaristo Morales", 
    "Los Cacicazgos", "Mirador Sur", "Mirador Norte", "Ensanche Quisqueya", "Paraíso", 
    "Los Prados", "El Millón", "Zona Universitaria", "La Julia", "Serrallés", "Arroyo Hondo"
  ],
  "Santo Domingo Este": [
    "Alma Rosa I", "Alma Rosa II", "Ensanche Ozama", "Los Mina", "Villa Duarte", 
    "Invivienda", "San Isidro", "Corales del Sur", "Hainamosa", "Villa Faro"
  ],
  "Santo Domingo Norte": [
    "Villa Mella", "Sabana Perdida", "Guaricanos", "Ciudad Modelo", "Jacobl Majesty"
  ],
  "Santo Domingo Oeste": [
    "Herrera", "Las Caobas", "Manoguayabo", "Los Alcarrizos", "Bayona"
  ],
  "Santiago": [
    "Santiago Centro", "Los Jardines", "Villa Olga", "La Trinitaria", "Gurabo", 
    "Hoya del Caimito", "Cienfuegos", "Pekín", "Nibaje"
  ],
  "La Altagracia": [
    "Punta Cana", "Bávaro", "Higüey", "Cap Cana", "Verón", "Bayahíbe"
  ],
  "La Romana": [
    "La Romana Centro", "Casa de Campo", "Buena Vista", "Villa Hermosa"
  ],
  "San Cristóbal": [
    "San Cristóbal Centro", "Madre Vieja", "Haina", "Nigua", "Yaguate"
  ],
  "Puerto Plata": [
    "Puerto Plata Centro", "Sosúa", "Cabarete", "Playa Dorada", "Torre Alta"
  ],
  "San Pedro de Macorís": [
    "San Pedro Centro", "Juan Dolio", "Guayacanes", "Consuelo"
  ],
  "La Vega": [
    "La Vega Centro", "Jarabacoa", "Constanza"
  ]
};

const Publish = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  // Dialogs State
  const [showPublishWelcome, setShowPublishWelcome] = useState(false);
  const [showIncompleteProfileDialog, setShowIncompleteProfileDialog] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
    province: "", // Provincia seleccionada
    serviceAreas: [] as string[], // Sectores seleccionados
    features: [] as string[],
    
    // Boost State
    selectedPlanId: 'free',
    
    imagePreview: "" as string | null,
    imageFile: null as File | null,
    facebook: "",
    instagram: "",
    website: ""
  });

  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        showError("Debes iniciar sesión para publicar");
        navigate("/login");
        return;
      }
      setSession(session);

      // Verificar perfil
      const { data: profile } = await supabase.from('profiles').select('first_name, last_name, phone').eq('id', session.user.id).single();
      if (profile) {
        if (!profile.first_name || !profile.last_name || !profile.phone) {
          setShowIncompleteProfileDialog(true);
          return;
        }
      }

      const hasSeenPublishMsg = localStorage.getItem("hasSeenPublishWelcome");
      if (!hasSeenPublishMsg) setTimeout(() => setShowPublishWelcome(true), 500);
    };

    checkAuthAndProfile();
  }, [navigate]);

  const handleClosePublishWelcome = () => {
    setShowPublishWelcome(false);
    localStorage.setItem("hasSeenPublishWelcome", "true");
  };

  const handleNext = () => {
    if (step === 1 && !formData.category) return showError("Selecciona una categoría");
    if (step === 2 && !formData.imagePreview) return showError("Sube al menos una foto de portada");
    if (step === 3) {
      if (!formData.title) return showError("Escribe un título");
      if (!formData.price) return showError("Define un precio");
      if (!formData.province) return showError("Selecciona una provincia");
      if (formData.serviceAreas.length === 0) return showError("Selecciona al menos un sector");
    }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, imagePreview: url, imageFile: file });
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const toggleSector = (sector: string) => {
    if (formData.serviceAreas.includes(sector)) {
      setFormData({ ...formData, serviceAreas: formData.serviceAreas.filter(s => s !== sector) });
    } else {
      setFormData({ ...formData, serviceAreas: [...formData.serviceAreas, sector] });
    }
  };

  const toggleAllSectors = () => {
    const currentSectors = DR_LOCATIONS[formData.province] || [];
    if (formData.serviceAreas.length === currentSectors.length) {
      setFormData({ ...formData, serviceAreas: [] });
    } else {
      setFormData({ ...formData, serviceAreas: [...currentSectors] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedPlan = BOOST_PLANS.find(p => p.id === formData.selectedPlanId) || BOOST_PLANS[0];
      
      // Si es el plan de pago (1day), NO activamos el boost inmediatamente. Esperamos al webhook.
      // Si es otro plan pagado (que aun no tiene link real) o free, seguimos lógica normal.
      const needsPayment = selectedPlan.id === '1day';
      const isPromoted = !needsPayment && selectedPlan.id !== 'free'; // Logica legacy para otros planes sin link real

      let imageUrl = null;
      if (formData.imageFile) {
        const fileExt = formData.imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('service-images').upload(fileName, formData.imageFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw new Error("Error al subir imagen");
        const { data } = supabase.storage.from('service-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      } else {
        throw new Error("Imagen requerida");
      }

      // Calcular promoted_until (solo para legacy boosts o free)
      let promotedUntil = null;
      if (isPromoted) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + selectedPlan.duration * 60 * 60 * 1000);
        promotedUntil = futureDate.toISOString();
      }

      const { data: serviceData, error } = await supabase.from('services').insert({
        user_id: session.user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        location: formData.province,
        service_areas: formData.serviceAreas,
        image_url: imageUrl,
        features: formData.features,
        is_promoted: isPromoted,
        promoted_until: promotedUntil,
        social_media: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          website: formData.website
        }
      }).select().single();

      if (error) throw error;
      
      // Manejo de Pagos Lemon Squeezy (Boost 24h)
      if (needsPayment && selectedPlan.checkoutUrl && serviceData) {
          const checkoutUrl = `${selectedPlan.checkoutUrl}&checkout[email]=${session.user.email}&checkout[custom][user_id]=${session.user.id}&checkout[custom][service_id]=${serviceData.id}`;
          
          showSuccess("Abriendo pasarela de pago...");
          
          // Crear y clickear enlace oculto para activar overlay
          const a = document.createElement('a');
          a.href = checkoutUrl;
          a.className = 'lemonsqueezy-button hidden';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // Opcional: Redirigir al perfil en el fondo para que cuando cierren el overlay vean sus servicios
          setTimeout(() => {
             navigate("/profile");
          }, 3000);

      } else {
          // Lógica Legacy para otros planes
          if (isPromoted && selectedPlan.price > 0) {
            await supabase.from('transactions').insert({
              user_id: session.user.id,
              amount: selectedPlan.price,
              description: `Boost inicial (${selectedPlan.label}) - ${formData.title}`,
              type: "boost"
            });
          }
          showSuccess("¡Servicio publicado con éxito!");
          navigate("/profile");
      }
      
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al publicar");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERS PER STEP ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Categoría</h2>
        <p className="text-gray-500">Elige la categoría que mejor describa tu servicio</p>
      </div>
      
      <div className="flex flex-col gap-3 pb-10">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = formData.category === cat.name;
          return (
            <div
              key={cat.name}
              onClick={() => setFormData({ ...formData, category: cat.name })}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border",
                isSelected 
                  ? "border-[#F97316] bg-orange-50 shadow-sm" 
                  : "border-gray-100 bg-white hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
                isSelected ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-500"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "font-medium text-base flex-1",
                isSelected ? "text-[#F97316] font-bold" : "text-gray-700"
              )}>
                {cat.name}
              </span>
              
              <div className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                isSelected ? "border-[#F97316] bg-[#F97316]" : "border-gray-300"
              )}>
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Foto de Portada</h2>
        <p className="text-gray-500">Sube una foto real de tu trabajo</p>
      </div>
      <div className="relative aspect-square w-full max-w-sm mx-auto bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden hover:border-[#F97316] transition-colors group cursor-pointer">
        {formData.imagePreview ? (
          <>
            <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-white font-bold">Cambiar foto</p></div>
          </>
        ) : (
          <div className="text-center p-6 space-y-3"><div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto text-[#F97316]"><UploadCloud className="h-8 w-8" /></div><div><p className="font-semibold text-gray-900">Subir imagen</p></div></div>
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Detalles y Ubicación</h2>
        <p className="text-gray-500">Describe tu servicio y dónde trabajas</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2"><Label>Título del Anuncio</Label><Input placeholder="Ej. Plomero Experto 24/7" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="h-12 text-lg" /></div>
        <div className="space-y-2"><Label>Descripción Detallada</Label><Textarea placeholder="Describe tu experiencia, herramientas, garantía, etc." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[120px]" /></div>
        
        <div className="space-y-2"><Label>Precio Base (RD$)</Label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><Input type="number" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="pl-10 h-12 text-lg font-bold" /></div></div>

        {/* SELECCIÓN DE ZONA */}
        <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-200 mt-4">
           <div className="flex items-center gap-2 mb-2"><MapPin className="h-5 w-5 text-[#F97316]" /><h3 className="font-bold text-gray-800">Zona de Cobertura</h3></div>
           
           <div className="space-y-2">
              <Label>Provincia / Área Principal</Label>
              <Select 
                value={formData.province} 
                onValueChange={(val) => {
                  setFormData({ ...formData, province: val, serviceAreas: [] }); // Resetear sectores al cambiar provincia
                }}
              >
                <SelectTrigger className="bg-white border-gray-300 h-12"><SelectValue placeholder="Selecciona provincia..." /></SelectTrigger>
                <SelectContent className="bg-white h-[300px]">
                  {Object.keys(DR_LOCATIONS).map((prov) => (<SelectItem key={prov} value={prov}>{prov}</SelectItem>))}
                </SelectContent>
              </Select>
           </div>

           {formData.province && (
             <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between items-center">
                   <Label>Sectores (Selecciona varios)</Label>
                   <Button variant="link" size="sm" onClick={toggleAllSectors} className="h-auto p-0 text-[#F97316]">
                      {formData.serviceAreas.length === DR_LOCATIONS[formData.province].length ? "Deseleccionar todos" : "Seleccionar todos"}
                   </Button>
                </div>
                <ScrollArea className="h-[200px] w-full rounded-md border bg-white p-4">
                   <div className="grid grid-cols-1 gap-2">
                      {DR_LOCATIONS[formData.province].map((sector) => {
                         const isSelected = formData.serviceAreas.includes(sector);
                         return (
                           <div 
                             key={sector} 
                             onClick={() => toggleSector(sector)}
                             className={cn(
                               "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                               isSelected ? "bg-orange-50 border-orange-200" : "hover:bg-gray-50 border-transparent"
                             )}
                           >
                              <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-[#F97316] border-[#F97316]" : "border-gray-300")}>
                                 {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className={cn("text-sm", isSelected ? "font-medium text-[#F97316]" : "text-gray-600")}>{sector}</span>
                           </div>
                         )
                      })}
                   </div>
                </ScrollArea>
                <p className="text-xs text-gray-400 text-right">{formData.serviceAreas.length} sectores seleccionados</p>
             </div>
           )}
        </div>

        {/* Features & Social Media (Compactados) */}
        <div className="space-y-2 pt-4">
           <Label>Características (Opcional)</Label>
           <div className="flex gap-2"><Input placeholder="Ej. A domicilio" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} className="h-10" /><Button onClick={addFeature} variant="secondary" size="sm"><Check className="h-4 w-4" /></Button></div>
           <div className="flex flex-wrap gap-2 pt-2">{formData.features.map((f, i) => (<Badge key={i} variant="secondary" className="pr-1 py-1 px-3 text-xs">{f}<X className="h-3 w-3 ml-2 cursor-pointer text-gray-400 hover:text-red-500" onClick={() => removeFeature(i)}/></Badge>))}</div>
        </div>

        <div className="pt-6 border-t mt-4">
           <Label>Redes Sociales (Opcional)</Label>
           <div className="grid grid-cols-1 gap-3 mt-3">
              <div className="relative"><Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600"/><Input placeholder="Link de Facebook" value={formData.facebook} onChange={e=>setFormData({...formData, facebook: e.target.value})} className="pl-10 h-11"/></div>
              <div className="relative"><Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-600"/><Input placeholder="Link de Instagram" value={formData.instagram} onChange={e=>setFormData({...formData, instagram: e.target.value})} className="pl-10 h-11"/></div>
              <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/><Input placeholder="Sitio Web" value={formData.website} onChange={e=>setFormData({...formData, website: e.target.value})} className="pl-10 h-11"/></div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Impulsa tu anuncio</h2>
        <p className="text-gray-500">Selecciona el plan de visibilidad</p>
      </div>

      <div className="grid gap-3 pt-4">
        {BOOST_PLANS.map((plan) => {
          const isSelected = formData.selectedPlanId === plan.id;
          
          return (
            <div 
              key={plan.id}
              onClick={() => {
                 setFormData({ ...formData, selectedPlanId: plan.id });
              }}
              className={cn(
                "relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group overflow-hidden",
                isSelected 
                  ? "border-[#F97316] bg-orange-50/50 shadow-md" 
                  : "border-gray-100 bg-white hover:border-orange-100"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                  POPULAR
                </div>
              )}
              
              <div className="flex items-center gap-3">
                 <div className={cn(
                   "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                   isSelected ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-400"
                 )}>
                    {plan.id === 'free' ? <Check className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
                 </div>
                 <div>
                    <h3 className={cn("font-bold text-base", isSelected ? "text-gray-900" : "text-gray-700")}>{plan.label}</h3>
                    <p className="text-xs text-gray-500">
                      {plan.id === 'free' ? "Visibilidad estándar" : `Destacado por ${plan.duration > 24 ? (plan.duration / 24) + ' días' : plan.duration + ' horas'}`}
                    </p>
                 </div>
              </div>

              <div className="text-right">
                 <p className={cn("font-bold text-lg", isSelected ? "text-[#F97316]" : "text-gray-900")}>
                    {plan.price === 0 ? "Gratis" : `RD$ ${plan.price}`}
                 </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep5 = () => {
    const selectedPlan = BOOST_PLANS.find(p => p.id === formData.selectedPlanId) || BOOST_PLANS[0];
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">¡Todo listo!</h2>
          <p className="text-gray-500">Revisa tu publicación</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-3xl flex justify-center items-center py-10">
          <div className="transform scale-110 pointer-events-none">
            <ServiceCard 
              title={formData.title} 
              price={`RD$ ${formData.price}`} 
              image={formData.imagePreview || ""} 
              badge={selectedPlan.id !== 'free' ? { text: "Destacado", color: "orange" } : undefined} 
            />
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Categoría</span><span className="font-medium text-gray-900">{formData.category}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Provincia</span><span className="font-medium text-gray-900">{formData.province}</span></div>
          <div className="flex justify-between text-sm items-start"><span className="text-gray-500">Sectores</span><span className="font-medium text-gray-900 text-right max-w-[60%]">{formData.serviceAreas.length > 3 ? `${formData.serviceAreas.slice(0,3).join(", ")}...` : formData.serviceAreas.join(", ")}</span></div>
          <div className="flex justify-between text-sm pt-2 border-t mt-2">
             <span className="text-gray-500">Plan seleccionado</span>
             <span className="font-medium text-gray-900 flex items-center gap-1">
                {selectedPlan.id !== 'free' && <Crown className="h-3 w-3 text-[#F97316]" />}
                {selectedPlan.label}
             </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t">
             <span className="text-gray-500 font-bold">Total a pagar</span>
             <span className="font-bold text-[#F97316] text-lg">
                {selectedPlan.price > 0 ? (
                   `RD$ ${selectedPlan.price}`
                ) : (
                   "Gratis"
                )}
             </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-safe">
      <AlertDialog open={showPublishWelcome} onOpenChange={setShowPublishWelcome}>
        <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto border-0 shadow-2xl">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-2 ring-8 ring-blue-50/50">
               <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
               <AlertDialogTitle className="text-xl font-bold text-gray-900">Potencia tu Negocio</AlertDialogTitle>
               <AlertDialogDescription className="text-gray-500 text-sm leading-relaxed">
                  Estás a punto de conectar con miles de clientes potenciales. Para asegurar tu éxito, te recomendamos:
               </AlertDialogDescription>
            </div>

            <div className="space-y-3 pt-2">
               <div className="flex items-start gap-3 text-left p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                     <h4 className="font-bold text-gray-900 text-xs">Perfil Completo</h4>
                     <p className="text-xs text-gray-500 leading-snug">Sube fotos reales y una descripción detallada.</p>
                  </div>
               </div>
               <div className="flex items-start gap-3 text-left p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                     <h4 className="font-bold text-gray-900 text-xs">Verificación</h4>
                     <p className="text-xs text-gray-500 leading-snug">Mantén tus datos actualizados para generar confianza.</p>
                  </div>
               </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogAction onClick={handleClosePublishWelcome} className="w-full bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl font-bold h-12 shadow-lg">
              Crear mi anuncio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showIncompleteProfileDialog} onOpenChange={setShowIncompleteProfileDialog}>
        <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto">
          <AlertDialogHeader className="text-center"><div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-2"><User className="h-6 w-6 text-red-500" /></div><AlertDialogTitle className="text-xl font-bold text-center">Perfil incompleto</AlertDialogTitle><AlertDialogDescription className="text-center text-gray-600 mt-2">Te falta: Teléfono.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 space-y-2"><AlertDialogAction onClick={() => navigate('/profile')} className="w-full bg-[#F97316] hover:bg-orange-600 rounded-xl">Completar perfil</AlertDialogAction><AlertDialogCancel onClick={() => {setShowIncompleteProfileDialog(false);navigate('/');}} className="w-full mt-2 rounded-xl border-gray-200">Cancelar</AlertDialogCancel></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header Sticky con Safe Area */}
      <div className="sticky top-0 bg-white z-10 pt-6 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={step === 1 ? () => navigate(-1) : handleBack}><ArrowLeft className="h-6 w-6 text-gray-900" /></Button>
          <div className="flex gap-1">{[1, 2, 3, 4, 5].map((s) => (<div key={s} className={cn("h-1.5 rounded-full transition-all duration-300",s === step ? "w-8 bg-[#F97316]" : s < step ? "w-4 bg-[#F97316]/40" : "w-2 bg-gray-100")} />))}</div>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 pb-32 pt-2 max-w-lg mx-auto">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe z-20">
        <div className="max-w-lg mx-auto flex gap-3">
            {step === 5 ? (
              <Button onClick={handleSubmit} disabled={loading} className="w-full bg-[#F97316] hover:bg-orange-600 text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-orange-200">
                {loading ? <Loader2 className="animate-spin mr-2" /> : (formData.selectedPlanId === '1day' ? `Pagar RD$ 99 y Publicar` : "Publicar Ahora")}
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full bg-[#0F172A] hover:bg-slate-800 text-white h-14 rounded-2xl text-lg font-bold shadow-lg">
                Siguiente <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Publish;