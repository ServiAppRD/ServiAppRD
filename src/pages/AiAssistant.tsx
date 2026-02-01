import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Loader2, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

// URL directa del proyecto para evitar errores de variables de entorno
const SUPABASE_PROJECT_URL = "https://nuciqjpwltieyrdzvagf.supabase.co";

interface PlaceData {
  id: string;
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  open_now?: boolean;
  image: string | null;
  place_id: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  places?: PlaceData[];
  isError?: boolean;
}

const PlaceCard = ({ place }: { place: PlaceData }) => {
  const [imageError, setImageError] = useState(false);

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`, '_blank');
  };

  return (
    <div className="snap-center shrink-0 w-[85vw] max-w-[320px] bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden flex flex-col group">
       <div className="h-40 w-full bg-gray-50 relative overflow-hidden">
          {place.image && !imageError ? (
             <img 
               src={place.image} 
               alt={place.name} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               onError={() => setImageError(true)}
               loading="lazy"
             />
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50/50 text-orange-200 p-4 text-center">
                <MapPin className="h-10 w-10 mb-2 opacity-30" />
                <span className="text-xs text-gray-400 font-medium px-4">
                  Imagen no disponible
                </span>
             </div>
          )}
          
          <div className="absolute top-3 left-3 flex gap-2">
            {place.rating > 0 && (
                <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-xs font-bold border border-gray-100/50">
                    <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                    <span className="text-gray-900">{place.rating}</span>
                    <span className="text-gray-400 font-normal">({place.user_ratings_total})</span>
                </div>
            )}
          </div>

          {place.open_now !== undefined && (
             <div className={cn(
                "absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md",
                place.open_now ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"
             )}>
                {place.open_now ? "Abierto" : "Cerrado"}
             </div>
          )}
       </div>
       
       <div className="p-4 flex flex-col flex-1 bg-white relative z-10">
          <h4 className="font-bold text-gray-900 text-base line-clamp-1 mb-1">{place.name}</h4>
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
            {place.address}
          </p>
          
          <button 
             className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-sm h-11 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
             onClick={openGoogleMaps}
          >
             <img src="/google-maps-icon.png" alt="Google Maps" className="h-5 w-5 object-contain" />
             <span>Ver en Google Maps</span>
          </button>
       </div>
    </div>
  );
};

const AiAssistant = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '👋 **¡Hola! Soy tu asistente inteligente.**\n\nPuedo ayudarte a encontrar servicios cercanos o buscar lugares en Google Maps.\n\n*Ejemplo: "Busco un taller mecánico en Santiago"*' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [profileCity, setProfileCity] = useState("Santo Domingo");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            showError("Inicia sesión para usar el asistente");
            navigate("/login");
            return;
        }
        setSession(session);
        const { data } = await supabase.from('profiles').select('city').eq('id', session.user.id).single();
        if (data?.city) setProfileCity(data.city);

        // Focus input on mount
        setTimeout(() => inputRef.current?.focus(), 500);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiLoading(true);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const response = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/ai-search`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
          },
          body: JSON.stringify({ 
            query: userMsg,
            location: profileCity 
          })
      });

      // Protección contra respuestas no-JSON
      const text = await response.text();
      let data;
      try {
          data = JSON.parse(text);
      } catch (e) {
          console.error("Respuesta no válida:", text);
          throw new Error("El asistente no respondió correctamente. Intenta de nuevo.");
      }

      if (!response.ok) {
          if (response.status === 429) {
             throw new Error("Has alcanzado tu límite diario de 5 consultas.");
          }
          throw new Error(data.error || "Error en el servidor");
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        places: data.places 
      }]);
      
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { 
          role: 'system', 
          content: error.message || "Lo siento, tuve un problema de conexión. Intenta más tarde.",
          isError: true 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white fixed inset-0 z-[2000]">
        {/* Header - Aumentado el padding top para evitar status bar */}
        <div className="px-4 pt-14 pb-3 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] z-20">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-gray-50 -ml-2">
                <ArrowLeft className="h-6 w-6 text-gray-700" />
            </Button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden">
                    <img src="/ai-icon.png" alt="AI" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="font-bold text-gray-900 leading-tight">Asistente IA</h1>
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En línea
                    </p>
                </div>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-gray-50/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-[0.02] pointer-events-none" />
            
            <ScrollArea className="h-full px-4 py-6" ref={scrollRef}>
                <div className="flex flex-col gap-6 pb-4 max-w-2xl mx-auto">
                    {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex flex-col w-full gap-2 animate-fade-in", msg.role === 'user' ? "items-end" : "items-start")}>
                        
                        {/* Avatar for Assistant */}
                        {msg.role === 'assistant' && (
                             <span className="text-[10px] text-gray-400 font-medium ml-2 mb-1 flex items-center gap-1">
                                <img src="/ai-icon.png" className="w-3 h-3 rounded-full" />
                                ServiAPP Bot
                             </span>
                        )}

                        <div className={cn(
                            "max-w-[85%] p-4 text-[15px] leading-relaxed shadow-sm break-words whitespace-pre-wrap relative",
                            msg.role === 'user' 
                                ? "bg-[#F97316] text-white rounded-[20px] rounded-tr-sm shadow-orange-200" 
                                : msg.isError 
                                    ? "bg-red-50 text-red-600 border border-red-100 rounded-[20px]"
                                    : "bg-white text-gray-700 rounded-[20px] rounded-tl-none border border-gray-100 shadow-sm"
                        )}>
                            {msg.role === 'assistant' ? (
                                <div className="markdown-body" dangerouslySetInnerHTML={{ 
                                __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                                }} />
                            ) : msg.content}
                        </div>

                        {/* Render Places Cards */}
                        {msg.places && msg.places.length > 0 && (
                            <div className="w-full flex gap-4 overflow-x-auto pb-6 pt-2 px-1 snap-x no-scrollbar mt-1 -ml-1">
                                {msg.places.map((place) => (
                                    <PlaceCard 
                                        key={place.id} 
                                        place={place}
                                    />
                                ))}
                                <div className="w-4 shrink-0" />
                            </div>
                        )}
                    </div>
                    ))}

                    {isAiLoading && (
                        <div className="flex justify-start w-full animate-pulse">
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-2">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 pb-safe">
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleAiSubmit} className="flex gap-2 relative">
                    <Input 
                        ref={inputRef}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Escribe aquí..."
                        className="flex-1 h-14 pl-5 pr-12 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-[#F97316] text-base transition-all shadow-inner"
                        disabled={isAiLoading}
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!chatInput.trim() || isAiLoading}
                        className={cn(
                            "absolute right-2 top-2 h-10 w-10 rounded-full transition-all duration-300",
                            chatInput.trim() 
                                ? "bg-[#F97316] hover:bg-orange-600 text-white shadow-md transform scale-100" 
                                : "bg-gray-200 text-gray-400 transform scale-90"
                        )}
                    >
                        {isAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default AiAssistant;