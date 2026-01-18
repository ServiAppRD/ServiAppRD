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
  DollarSign, Tag, Sparkles, UploadCloud, X, Loader2, Rocket, User, Zap,
  Facebook, Instagram, Globe, Link as LinkIcon, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceCard } from "@/components/ServiceCard";

// Constantes de Datos
const CATEGORIES = [
  "Plomería", "Electricidad", "Limpieza", "Mecánica", "Carpintería", 
  "Jardinería", "Tecnología", "Belleza y Estética", "Construcción", 
  "Transporte", "Educación", "Salud y Bienestar", "Eventos", "Otros Servicios"
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
  const [userBoosts, setUserBoosts] = useState(0);
  const [useBoostToPay, setUseBoostToPay] = useState(false);
  
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
    isPromoted: false,
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

      // Fetch user boosts
      const { data: stats } = await supabase.from('user_stats').select('boosts').eq('user_id', session.user.id).maybeSingle();
      if (stats) setUserBoosts(stats.boosts || 0);

      // Verificar perfil
      const { data: profile } = await supabase.from('profiles').select('first_name, last_name, phone, city').eq('id', session.user.id).single();
      if (profile) {
        if (!profile.first_name || !profile.last_name || !profile.phone || !profile.city) {
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
      if (formData.isPromoted && useBoostToPay) {
        if (userBoosts > 0) {
           await supabase.from('user_stats').update({ boosts: userBoosts - 1 }).eq('user_id', session.user.id);
        } else {
           throw new Error("No tienes suficientes boosts");
        }
      }

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

      const { error } = await supabase.from('services').insert({
        user_id: session.user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        location: formData.province, // Guardamos la provincia como ubicación principal
        service_areas: formData.serviceAreas, // Guardamos los sectores específicos
        image_url: imageUrl,
        features: formData.features,
        is_promoted: formData.isPromoted,
        social_media: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          website: formData.website
        }
      });

      if (error) throw error;
      showSuccess("¡Servicio publicado con éxito!");
      navigate("/profile");
      
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
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Categoría</h2>
        <p className="text-gray-500">¿Qué tipo de servicio ofreces?</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <Label>Categoría Principal</Label>
        <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
          <SelectTrigger className="h-14 bg-gray-50 border-gray-200 rounded-xl px-4"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent className="bg-white max-h-[300px]">{CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Foto de Portada</h2>
        <p className="text-gray-500">Sube una foto real de tu trabajo</p>
      </div>
      <div className="relative aspect-square w-full max-w-sm mx-auto bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden hover:border-[#F97316] transition-colors group">
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
        <p className="text-gray-500">¿Dónde puedes trabajar?</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2"><Label>Título</Label><Input placeholder="Ej. Plomero Experto 24/7" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="h-12" /></div>
        <div className="space-y-2"><Label>Descripción</Label><Textarea placeholder="Detalles de tu servicio..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[100px]" /></div>
        
        <div className="space-y-2"><Label>Precio Base (RD$)</Label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input type="number" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="pl-9 h-12" /></div></div>

        {/* SELECCIÓN DE ZONA */}
        <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-200">
           <div className="flex items-center gap-2 mb-2"><MapPin className="h-5 w-5 text-[#F97316]" /><h3 className="font-bold text-gray-800">Zona de Cobertura</h3></div>
           
           <div className="space-y-2">
              <Label>Provincia / Área Principal</Label>
              <Select 
                value={formData.province} 
                onValueChange={(val) => {
                  setFormData({ ...formData, province: val, serviceAreas: [] }); // Resetear sectores al cambiar provincia
                }}
              >
                <SelectTrigger className="bg-white border-gray-300 h-11"><SelectValue placeholder="Selecciona provincia..." /></SelectTrigger>
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
                               "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border",
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
        <div className="space-y-2 pt-2">
           <Label>Características Adicionales</Label>
           <div className="flex gap-2"><Input placeholder="Ej. A domicilio" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} className="h-10" /><Button onClick={addFeature} variant="secondary" size="sm"><Check className="h-4 w-4" /></Button></div>
           <div className="flex flex-wrap gap-2">{formData.features.map((f, i) => (<Badge key={i} variant="secondary" className="pr-1">{f}<X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeFeature(i)}/></Badge>))}</div>
        </div>

        <div className="pt-4 border-t">
           <Label>Redes Sociales (Opcional)</Label>
           <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="relative"><Facebook className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-600"/><Input placeholder="Facebook" value={formData.facebook} onChange={e=>setFormData({...formData, facebook: e.target.value})} className="pl-7 h-9 text-xs"/></div>
              <div className="relative"><Instagram className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-pink-600"/><Input placeholder="Instagram" value={formData.instagram} onChange={e=>setFormData({...formData, instagram: e.target.value})} className="pl-7 h-9 text-xs"/></div>
              <div className="relative"><Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500"/><Input placeholder="Web" value={formData.website} onChange={e=>setFormData({...formData, website: e.target.value})} className="pl-7 h-9 text-xs"/></div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Impulsa tu anuncio</h2>
        <p className="text-gray-500">Llega a más clientes potenciales</p>
      </div>

      <div className="grid gap-4 pt-4">
        {/* FREE OPTION */}
        <div onClick={() => {setFormData({ ...formData, isPromoted: false }); setUseBoostToPay(false);}} className={cn("p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between", !formData.isPromoted ? "border-gray-900 bg-gray-900 text-white shadow-lg" : "border-gray-200 bg-white opacity-60")}>
          <div><h3 className="font-bold text-lg">Gratis</h3><p className="text-sm opacity-80">Publicación estándar</p></div>
          <div className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center">{!formData.isPromoted && <div className="h-3 w-3 rounded-full bg-white" />}</div>
        </div>

        {/* PROMOTED OPTION */}
        <div onClick={() => setFormData({ ...formData, isPromoted: true })} className={cn("relative p-6 rounded-2xl border-2 cursor-pointer transition-all overflow-hidden", formData.isPromoted ? "border-[#F97316] bg-orange-50" : "border-gray-200 bg-white")}>
          {formData.isPromoted && <div className="absolute top-0 right-0 bg-[#F97316] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">RECOMENDADO</div>}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-[#F97316] to-pink-500 p-2 rounded-lg text-white"><Sparkles className="h-5 w-5" /></div>
              <div><h3 className="font-bold text-lg text-gray-900">Destacado</h3><p className="text-[#F97316] font-bold">RD$ 250.00</p></div>
            </div>
            <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center", formData.isPromoted ? "border-[#F97316]" : "border-gray-300")}>{formData.isPromoted && <div className="h-3 w-3 rounded-full bg-[#F97316]" />}</div>
          </div>
          {formData.isPromoted && userBoosts > 0 && (
             <div onClick={(e) => { e.stopPropagation(); setUseBoostToPay(!useBoostToPay); }} className={`mt-3 p-3 rounded-xl border flex items-center justify-between ${useBoostToPay ? "bg-purple-100 border-purple-500" : "bg-white border-gray-200"}`}>
                <div className="flex items-center gap-2"><div className="bg-purple-600 text-white p-1 rounded-full"><Zap className="h-4 w-4" /></div><div className="text-left"><p className="text-sm font-bold text-purple-900">Usar 1 Boost Gratis</p><p className="text-xs text-purple-600">Tienes {userBoosts} disponibles</p></div></div>
                <div className={`h-5 w-5 rounded border ${useBoostToPay ? "bg-purple-600 border-purple-600" : "border-gray-300"} flex items-center justify-center`}>{useBoostToPay && <Check className="h-3 w-3 text-white" />}</div>
             </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">¡Todo listo!</h2>
        <p className="text-gray-500">Revisa tu publicación</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-3xl flex justify-center items-center py-10">
        <div className="transform scale-110 pointer-events-none">
          <ServiceCard title={formData.title} price={`RD$ ${formData.price}`} image={formData.imagePreview || ""} badge={formData.isPromoted ? { text: "Destacado", color: "orange" } : undefined} />
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Categoría</span><span className="font-medium text-gray-900">{formData.category}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Provincia</span><span className="font-medium text-gray-900">{formData.province}</span></div>
        <div className="flex justify-between text-sm items-start"><span className="text-gray-500">Sectores</span><span className="font-medium text-gray-900 text-right max-w-[60%]">{formData.serviceAreas.length > 3 ? `${formData.serviceAreas.slice(0,3).join(", ")}...` : formData.serviceAreas.join(", ")}</span></div>
        <div className="flex justify-between text-sm pt-2 border-t"><span className="text-gray-500">Total a pagar</span><span className="font-bold text-[#F97316]">{formData.isPromoted ? (useBoostToPay ? <span className="text-purple-600 flex items-center gap-1"><Zap className="h-3 w-3"/> 1 Boost</span> : "RD$ 250.00") : "Gratis"}</span></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-safe">
      <AlertDialog open={showPublishWelcome} onOpenChange={setShowPublishWelcome}>
        <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-2"><Rocket className="h-6 w-6 text-[#F97316]" /></div>
            <AlertDialogTitle className="text-xl font-bold text-center">¡Bienvenido!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 mt-2">Publica tu servicio y llega a miles de personas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction onClick={handleClosePublishWelcome} className="w-full bg-[#F97316] hover:bg-orange-600 rounded-xl">Comenzar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showIncompleteProfileDialog} onOpenChange={setShowIncompleteProfileDialog}>
        <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto">
          <AlertDialogHeader className="text-center"><div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-2"><User className="h-6 w-6 text-red-500" /></div><AlertDialogTitle className="text-xl font-bold text-center">Perfil incompleto</AlertDialogTitle><AlertDialogDescription className="text-center text-gray-600 mt-2">Te falta: Teléfono o Ciudad.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 space-y-2"><AlertDialogAction onClick={() => navigate('/profile')} className="w-full bg-[#F97316] hover:bg-orange-600 rounded-xl">Completar perfil</AlertDialogAction><AlertDialogCancel onClick={() => {setShowIncompleteProfileDialog(false);navigate('/');}} className="w-full mt-2 rounded-xl border-gray-200">Cancelar</AlertDialogCancel></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="px-4 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <Button variant="ghost" size="icon" onClick={step === 1 ? () => navigate(-1) : handleBack}><ArrowLeft className="h-6 w-6 text-gray-900" /></Button>
        <div className="flex gap-1">{[1, 2, 3, 4, 5].map((s) => (<div key={s} className={cn("h-1.5 rounded-full transition-all duration-300",s === step ? "w-8 bg-[#F97316]" : s < step ? "w-4 bg-[#F97316]/40" : "w-2 bg-gray-100")} />))}</div>
        <div className="w-10" />
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
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Publicar Ahora"}
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