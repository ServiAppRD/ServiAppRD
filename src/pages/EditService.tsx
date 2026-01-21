import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { 
  ArrowLeft, Check, UploadCloud, Loader2, X, MapPin, DollarSign, Facebook, Instagram, Globe, Save
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mismas constantes que en Publish.tsx para consistencia
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

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
    province: "", 
    serviceAreas: [] as string[],
    features: [] as string[],
    imagePreview: "" as string | null,
    imageFile: null as File | null,
    facebook: "",
    instagram: "",
    website: ""
  });
  
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
      const fetchData = async () => {
          if (!id) return;
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                showError("Inicia sesión para editar");
                return navigate('/login');
            }

            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) throw new Error("Servicio no encontrado");

            if (data.user_id !== session.user.id) {
                showError("No tienes permiso para editar este servicio");
                return navigate('/profile');
            }

            setFormData({
                category: data.category,
                title: data.title,
                description: data.description || "",
                price: data.price?.toString() || "",
                province: data.location || "",
                serviceAreas: Array.isArray(data.service_areas) ? data.service_areas : [],
                features: Array.isArray(data.features) ? data.features : [],
                imagePreview: data.image_url,
                imageFile: null,
                facebook: (data.social_media as any)?.facebook || "",
                instagram: (data.social_media as any)?.instagram || "",
                website: (data.social_media as any)?.website || ""
            });
          } catch (error: any) {
              console.error(error);
              showError(error.message);
              navigate('/profile');
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, [id, navigate]);

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

  const handleSave = async () => {
      setSaving(true);
      try {
          if (!formData.title) throw new Error("El título es obligatorio");
          if (!formData.price) throw new Error("El precio es obligatorio");

          let imageUrl = formData.imagePreview;

          // Subir nueva imagen si existe
          if (formData.imageFile) {
            const fileExt = formData.imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('service-images').upload(fileName, formData.imageFile, { cacheControl: '3600', upsert: false });
            if (uploadError) throw new Error("Error al subir imagen");
            const { data } = supabase.storage.from('service-images').getPublicUrl(fileName);
            imageUrl = data.publicUrl;
          }

          const { error } = await supabase
            .from('services')
            .update({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                price: parseFloat(formData.price),
                location: formData.province,
                service_areas: formData.serviceAreas,
                image_url: imageUrl,
                features: formData.features,
                social_media: {
                    facebook: formData.facebook,
                    instagram: formData.instagram,
                    website: formData.website
                }
            })
            .eq('id', id);

          if (error) throw error;
          showSuccess("Servicio actualizado correctamente");
          navigate('/profile');

      } catch (error: any) {
          console.error(error);
          showError(error.message || "Error al actualizar");
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#F97316] h-8 w-8" /></div>;

  return (
    <div className="min-h-screen bg-white pb-32 animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white z-40 pt-6 shadow-sm border-b border-gray-100">
            <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-6 w-6 text-gray-900" /></Button>
                    <h1 className="text-xl font-bold text-gray-900">Editar Publicación</h1>
                </div>
                
                {/* Save Button in Header */}
                <Button 
                   onClick={handleSave} 
                   disabled={saving}
                   variant="ghost"
                   className="text-[#F97316] font-bold hover:bg-orange-50"
                >
                   {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar"}
                </Button>
            </div>
        </div>

        <div className="p-6 max-w-lg mx-auto space-y-8">
            
            {/* Image Section */}
            <div className="space-y-3">
                <Label className="text-base">Foto de Portada</Label>
                <div className="relative aspect-video w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-[#F97316] transition-colors group cursor-pointer">
                    {formData.imagePreview ? (
                    <>
                        <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-white font-bold flex items-center gap-2"><UploadCloud className="h-5 w-5"/> Cambiar foto</p></div>
                    </>
                    ) : (
                        <div className="text-center p-6 space-y-2 text-gray-400"><UploadCloud className="h-8 w-8 mx-auto" /><p>Subir imagen</p></div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Título del Anuncio</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="h-12 text-lg" />
                </div>
                
                <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Precio Base (RD$)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="pl-10 h-12 text-lg font-bold" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[120px]" />
                </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 p-5 rounded-2xl space-y-4 border border-gray-100">
               <div className="flex items-center gap-2 text-gray-900 font-bold"><MapPin className="h-5 w-5 text-[#F97316]" /> Ubicación</div>
               
               <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Select value={formData.province} onValueChange={(val) => setFormData({ ...formData, province: val, serviceAreas: [] })}>
                    <SelectTrigger className="bg-white h-12"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>{Object.keys(DR_LOCATIONS).map((prov) => (<SelectItem key={prov} value={prov}>{prov}</SelectItem>))}</SelectContent>
                  </Select>
               </div>

               {formData.province && (
                 <div className="space-y-2">
                    <Label>Sectores</Label>
                    <ScrollArea className="h-[150px] w-full rounded-xl border bg-white p-3">
                       <div className="grid grid-cols-1 gap-1">
                          {DR_LOCATIONS[formData.province]?.map((sector) => {
                             const isSelected = formData.serviceAreas.includes(sector);
                             return (
                               <div key={sector} onClick={() => toggleSector(sector)} className={cn("flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all", isSelected ? "bg-orange-50 text-[#F97316]" : "hover:bg-gray-50 text-gray-600")}>
                                  <div className={cn("w-4 h-4 rounded border flex items-center justify-center", isSelected ? "bg-[#F97316] border-[#F97316]" : "border-gray-300")}>{isSelected && <Check className="h-3 w-3 text-white" />}</div>
                                  <span className="text-sm font-medium">{sector}</span>
                               </div>
                             )
                          })}
                       </div>
                    </ScrollArea>
                 </div>
               )}
            </div>

            {/* Extra Info */}
            <div className="space-y-4">
               <Label>Características</Label>
               <div className="flex gap-2"><Input placeholder="Ej. A domicilio" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} className="h-10" /><Button onClick={addFeature} variant="secondary"><Check className="h-4 w-4" /></Button></div>
               <div className="flex flex-wrap gap-2">{formData.features.map((f, i) => (<Badge key={i} variant="secondary" className="pr-1">{f}<X className="h-3 w-3 ml-2 cursor-pointer hover:text-red-500" onClick={() => removeFeature(i)}/></Badge>))}</div>
            </div>

            <div className="space-y-3 pt-2">
                <Label>Redes Sociales</Label>
                <div className="relative"><Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600"/><Input placeholder="Facebook URL" value={formData.facebook} onChange={e=>setFormData({...formData, facebook: e.target.value})} className="pl-10"/></div>
                <div className="relative"><Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-600"/><Input placeholder="Instagram URL" value={formData.instagram} onChange={e=>setFormData({...formData, instagram: e.target.value})} className="pl-10"/></div>
                <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/><Input placeholder="Website URL" value={formData.website} onChange={e=>setFormData({...formData, website: e.target.value})} className="pl-10"/></div>
            </div>
        </div>

        {/* Floating Bottom Button (Backup) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-lg mx-auto">
                <Button onClick={handleSave} disabled={saving} className="w-full bg-[#F97316] hover:bg-orange-600 text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-orange-200">
                    {saving ? <Loader2 className="animate-spin mr-2" /> : "Guardar Cambios"}
                </Button>
            </div>
        </div>
    </div>
  );
};

export default EditService;