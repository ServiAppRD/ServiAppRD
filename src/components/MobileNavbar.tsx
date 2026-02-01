import { Home, PlusCircle, Search, User, Crown, Sparkles, Send, Bot, Loader2, MapPin, Star, Phone, Navigation } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
  role: 'user' | 'assistant';
  content: string;
  places?: PlaceData[];
}

export const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPlus, setIsPlus] = useState(false);
  const [profileCity, setProfileCity] = useState("Santo Domingo");
  
  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '👋 ¡Hola! Soy el asistente de ServiAPP. Puedo encontrar profesionales verificados o buscar en Google Maps lo que necesites.' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data } = await supabase.from('profiles').select('avatar_url, is_plus, city').eq('id', session.user.id).single();
        if (data) {
           setAvatarUrl(data.avatar_url);
           setIsPlus(data.is_plus || false);
           if(data.city) setProfileCity(data.city);
        }
      }
    };

    fetchProfile();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
      }, 100);
    }
  }, [messages, isChatOpen]);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { 
          query: userMsg,
          location: profileCity 
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        places: data.places 
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, tuve un problema conectando. Por favor intenta de nuevo." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const openGoogleMaps = (placeName: string, placeId: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}&query_place_id=${placeId}`, '_blank');
  };

  const shouldHideNavbar = 
    ["/publish", "/login"].includes(location.pathname) || 
    location.pathname.startsWith("/service/") ||
    location.pathname.startsWith("/edit-service/");

  if (shouldHideNavbar) {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path && !location.search;
  };

  const NavItem = ({ icon: Icon, label, path, action, customContent, activeColor = "text-[#F97316]" }: any) => (
    <button 
      onClick={action || (() => navigate(path))}
      className={cn(
        "flex flex-col items-center justify-center gap-1 min-w-[3.5rem] transition-colors",
        isActive(path) ? activeColor : "text-gray-400 hover:text-gray-600"
      )}
    >
      {customContent ? (
        customContent
      ) : (
        <Icon className={cn("h-6 w-6", isActive(path) ? "fill-current" : "")} strokeWidth={2} />
      )}
      <span className={cn("text-[10px] font-medium", isPlus && path === "/profile" && isActive(path) ? "text-[#0239c7] font-bold" : "")}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 px-6 flex justify-between items-center z-[999] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavItem icon={Home} label="Inicio" path="/" />
      <NavItem icon={Search} label="Buscar" path="/search" />
      <NavItem icon={PlusCircle} label="Publicar" path="/publish" />
      
      {/* AI Chat Button */}
      <Drawer open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DrawerTrigger asChild>
           <button className={cn(
               "flex flex-col items-center justify-center gap-1 min-w-[3.5rem] transition-colors",
               isChatOpen ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
           )}>
              <Sparkles className={cn("h-6 w-6", isChatOpen ? "fill-[#F97316]" : "")} strokeWidth={2} />
              <span className="text-[10px] font-medium">IA</span>
           </button>
        </DrawerTrigger>
        
        <DrawerContent className="h-[85vh] flex flex-col rounded-t-[2rem] z-[2000]">
           <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mt-4 mb-2" />
           <DrawerHeader className="text-left border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-[#F97316]" />
                 </div>
                 <div>
                    <DrawerTitle className="text-lg font-bold text-gray-900">Asistente ServiAPP</DrawerTitle>
                    <DrawerDescription className="text-xs text-gray-500">
                        Busca servicios en nuestra red o en Google Maps
                    </DrawerDescription>
                 </div>
              </div>
           </DrawerHeader>

           <div className="flex-1 bg-gray-50 overflow-hidden relative">
              <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
                 <div className="flex flex-col gap-6 pb-6">
                    {messages.map((msg, idx) => (
                       <div key={idx} className={cn("flex flex-col w-full gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                          <div className={cn(
                            "max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm",
                            msg.role === 'user' 
                              ? "bg-[#F97316] text-white rounded-2xl rounded-tr-sm" 
                              : "bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-gray-100"
                          )}>
                             {msg.role === 'assistant' ? (
                                <div className="markdown-body" dangerouslySetInnerHTML={{ 
                                   __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                                }} />
                             ) : msg.content}
                          </div>

                          {/* Render Places Cards if available */}
                          {msg.places && msg.places.length > 0 && (
                            <div className="w-full flex gap-3 overflow-x-auto pb-2 px-1 snap-x no-scrollbar mt-1">
                               {msg.places.map((place) => (
                                 <div 
                                    key={place.id} 
                                    className="snap-center shrink-0 w-[220px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
                                 >
                                    <div className="h-28 w-full bg-gray-100 relative">
                                       {place.image ? (
                                         <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                                       ) : (
                                         <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                                            <MapPin className="h-10 w-10" />
                                         </div>
                                       )}
                                       {place.rating > 0 && (
                                         <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm text-xs font-bold">
                                            <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                                            {place.rating} <span className="text-gray-400 font-normal">({place.user_ratings_total})</span>
                                         </div>
                                       )}
                                    </div>
                                    <div className="p-3 flex flex-col flex-1">
                                       <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{place.name}</h4>
                                       <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3 flex-1">{place.address}</p>
                                       
                                       <Button 
                                          size="sm" 
                                          className="w-full bg-gray-50 hover:bg-gray-100 text-[#F97316] font-bold text-xs h-8 border border-gray-100"
                                          onClick={() => openGoogleMaps(place.name, place.place_id)}
                                       >
                                          <Navigation className="h-3 w-3 mr-1.5" /> Ver en Mapa
                                       </Button>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>
                    ))}
                    {isAiLoading && (
                       <div className="flex justify-start w-full">
                          <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-2">
                             <Loader2 className="h-4 w-4 animate-spin text-[#F97316]" />
                             <span className="text-xs text-gray-500 font-medium">Buscando los mejores lugares...</span>
                          </div>
                       </div>
                    )}
                 </div>
              </ScrollArea>
           </div>

           <div className="p-4 bg-white border-t border-gray-100 pb-[calc(env(safe-area-inset-bottom)+20px)]">
              <form onSubmit={handleAiSubmit} className="flex gap-2">
                 <Input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ej. Plomeros cerca de mi..."
                    className="flex-1 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#F97316]"
                    disabled={isAiLoading}
                    autoFocus={false}
                 />
                 <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!chatInput.trim() || isAiLoading}
                    className="h-12 w-12 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white shadow-lg shadow-orange-200"
                 >
                    <Send className="h-5 w-5" />
                 </Button>
              </form>
           </div>
        </DrawerContent>
      </Drawer>
      
      <NavItem 
        path="/profile" 
        label="Cuenta" 
        customContent={
           <div className="relative">
             <Avatar className={cn(
                "h-7 w-7 transition-all", 
                isActive("/profile") ? (isPlus ? "border-2 border-[#0239c7]" : "border-2 border-[#F97316]") : "border border-transparent"
             )}>
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback className="bg-gray-100 text-gray-400">
                    <User className="h-4 w-4" />
                </AvatarFallback>
             </Avatar>
             {isPlus && (
               <div className="absolute -top-1.5 -right-1.5 bg-[#0239c7] text-white rounded-full p-[2px] border border-white">
                  <Crown className="h-2 w-2 fill-white" />
               </div>
             )}
           </div>
        }
      />
    </div>
  );
};