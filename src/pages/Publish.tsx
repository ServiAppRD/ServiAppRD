import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { 
  ArrowLeft, ArrowRight, Camera, Check, ChevronRight, 
  DollarSign, MapPin, Tag, Sparkles, UploadCloud, X, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceCard } from "@/components/ServiceCard";

const CATEGORIES = [
  { id: "Plomería", icon: "🔧" },
  { id: "Electricidad", icon: "⚡" },
  { id: "Limpieza", icon: "🧹" },
  { id: "Mecánica", icon: "🚗" },
  { id: "Carpintería", icon: "🪚" },
  { id: "Jardinería", icon: "🌿" },
  { id: "Tecnología", icon: "💻" },
  { id: "Belleza", icon: "💅" },
  { id: "Otros", icon: "📦" }
];

const Publish = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
    location: "",
    features: [] as string[],
    isPromoted: false,
    imagePreview: "" as string | null,
    imageFile: null as File | null
  });

  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        showError("Debes iniciar sesión para publicar");
        navigate("/login");
      }
      setSession(session);
    });
  }, [navigate]);

  const handleNext = () => {
    if (step === 1 && !formData.category) return showError("Selecciona una categoría");
    if (step === 2 && !formData.imagePreview) return showError("Sube al menos una foto de portada");
    if (step === 3) {
      if (!formData.title) return showError("Escribe un título");
      if (!formData.price) return showError("Define un precio");
      if (!formData.location) return showError("Define tu ubicación");
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
      setFormData({ 
        ...formData, 
        features: [...formData.features, featureInput.trim()] 
      });
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let imageUrl = null;

      // 1. Subir imagen (Requerido)
      if (formData.imageFile) {
        // Limpiar nombre de archivo para evitar caracteres extraños
        const fileExt = formData.imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Subir al bucket
        const { error: uploadError, data } = await supabase.storage
          .from('service-images')
          .upload(fileName, formData.imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Error upload:", uploadError);
          throw new Error("Error al subir la imagen. Intenta de nuevo.");
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      } else {
        // Si no hay archivo (pero pasó la validación de preview), es un error raro
        throw new Error("No se ha seleccionado ninguna imagen.");
      }

      // 2. Insertar en base de datos
      const { error } = await supabase.from('services').insert({
        user_id: session.user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        location: formData.location,
        image_url: imageUrl,
        features: formData.features,
        is_promoted: formData.isPromoted
      });

      if (error) throw error;

      showSuccess("¡Servicio publicado con éxito!");
      navigate("/profile");
      
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Ocurrió un error al publicar");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERS PER STEP ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Elige una categoría</h2>
        <p className="text-gray-500">¿Qué tipo de servicio vas a ofrecer?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFormData({ ...formData, category: cat.id })}
            className={cn(
              "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200",
              formData.category === cat.id 
                ? "border-[#F97316] bg-orange-50 text-[#F97316]" 
                : "border-gray-100 bg-white text-gray-600 hover:border-orange-100"
            )}
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="font-semibold text-sm">{cat.id}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Sube una portada</h2>
        <p className="text-gray-500">Una buena foto atrae más clientes</p>
      </div>

      <div className="relative aspect-square w-full max-w-sm mx-auto bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden hover:border-[#F97316] transition-colors group">
        {formData.imagePreview ? (
          <>
            <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white font-bold">Cambiar foto</p>
            </div>
          </>
        ) : (
          <div className="text-center p-6 space-y-3">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto text-[#F97316]">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Toca para subir</p>
              <p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p>
            </div>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
        <Camera className="h-5 w-5 text-blue-500 mt-0.5" />
        <p className="text-sm text-blue-700">
          Tip: Usa fotos reales de tus trabajos anteriores, evita imágenes de internet.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Detalles del servicio</h2>
        <p className="text-gray-500">Describe lo que ofreces claramente</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Título del servicio</Label>
          <Input 
            placeholder="Ej. Reparación de Aires Acondicionados"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="h-12 text-base focus-visible:ring-[#F97316]"
          />
        </div>

        <div className="space-y-2">
          <Label>Descripción</Label>
          <Textarea 
            placeholder="Explica tu experiencia, herramientas, garantías..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[100px] text-base focus-visible:ring-[#F97316]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Precio (Desde)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="pl-9 h-12 focus-visible:ring-[#F97316]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ubicación</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Ej. Santo Domingo"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="pl-9 h-12 focus-visible:ring-[#F97316]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label>Características (Opcional)</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="Ej. A domicilio, Garantía 30 días..."
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFeature()}
              className="h-11 focus-visible:ring-[#F97316]"
            />
            <Button onClick={addFeature} type="button" variant="secondary" className="bg-orange-100 text-[#F97316] hover:bg-orange-200">
              <Check className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.features.map((feat, i) => (
              <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                {feat}
                <button onClick={() => removeFeature(i)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Impulsa tu anuncio</h2>
        <p className="text-gray-500">Llega a más clientes potenciales más rápido</p>
      </div>

      <div className="grid gap-4 pt-4">
        <div 
          onClick={() => setFormData({ ...formData, isPromoted: false })}
          className={cn(
            "p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
            !formData.isPromoted 
              ? "border-gray-900 bg-gray-900 text-white shadow-lg" 
              : "border-gray-200 bg-white text-gray-600 opacity-60 hover:opacity-100"
          )}
        >
          <div>
            <h3 className="font-bold text-lg">Gratis</h3>
            <p className={!formData.isPromoted ? "text-gray-300 text-sm" : "text-gray-500 text-sm"}>
              Publicación estándar
            </p>
          </div>
          <div className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center">
            {!formData.isPromoted && <div className="h-3 w-3 rounded-full bg-white" />}
          </div>
        </div>

        <div 
          onClick={() => setFormData({ ...formData, isPromoted: true })}
          className={cn(
            "relative p-6 rounded-2xl border-2 cursor-pointer transition-all overflow-hidden group",
            formData.isPromoted 
              ? "border-[#F97316] bg-orange-50" 
              : "border-gray-200 bg-white hover:border-orange-200"
          )}
        >
          {formData.isPromoted && (
            <div className="absolute top-0 right-0 bg-[#F97316] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
              RECOMENDADO
            </div>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-[#F97316] to-pink-500 p-2 rounded-lg text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Destacado</h3>
                <p className="text-[#F97316] font-bold">$5.00 <span className="text-gray-400 font-normal text-xs">/único pago</span></p>
              </div>
            </div>
            <div className={cn(
              "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
              formData.isPromoted ? "border-[#F97316]" : "border-gray-300"
            )}>
              {formData.isPromoted && <div className="h-3 w-3 rounded-full bg-[#F97316]" />}
            </div>
          </div>
          
          <ul className="space-y-2 ml-1">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-[#F97316]" /> Aparece primero en búsquedas
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-[#F97316]" /> Etiqueta "Destacado"
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-[#F97316]" /> 3x más visualizaciones
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">¡Todo listo!</h2>
        <p className="text-gray-500">Revisa cómo se verá tu publicación</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-3xl flex justify-center items-center py-10">
        <div className="transform scale-110 pointer-events-none">
          <ServiceCard 
            title={formData.title}
            price={`$${formData.price}`}
            image={formData.imagePreview || ""}
            badge={formData.isPromoted ? { text: "Destacado", color: "orange" } : undefined}
          />
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Categoría</span>
          <span className="font-medium text-gray-900">{formData.category}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ubicación</span>
          <span className="font-medium text-gray-900">{formData.location}</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t">
          <span className="text-gray-500">Total a pagar</span>
          <span className="font-bold text-[#F97316]">{formData.isPromoted ? "$5.00 USD" : "Gratis"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-safe">
      <div className="px-4 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <Button variant="ghost" size="icon" onClick={step === 1 ? () => navigate(-1) : handleBack}>
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </Button>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                s === step ? "w-8 bg-[#F97316]" : s < step ? "w-4 bg-[#F97316]/40" : "w-2 bg-gray-100"
              )} 
            />
          ))}
        </div>
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
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full bg-[#F97316] hover:bg-orange-600 text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-orange-200"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Publicar Ahora"}
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                className="w-full bg-[#0F172A] hover:bg-slate-800 text-white h-14 rounded-2xl text-lg font-bold shadow-lg"
              >
                Siguiente <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Publish;