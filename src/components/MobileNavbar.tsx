import { Home, PlusCircle, Search, User, Crown, Sparkles, Send, Bot, Loader2 } from "lucide-react";
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
    { role: 'assistant', content: '👋 ¡Hola! Soy el asistente de ServiAPP. Busco en Google Places y en nuestra base de datos para encontrar lo que necesitas.' }
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
    
    // Subscribe to auth changes to update avatar/plus status
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

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, tuve un problema conectando. Por favor intenta de nuevo." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Ocultar la barra de navegación en rutas específicas:
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
    // Se añade un padding-bottom calculado: área segura + 16px (pb-4) para levantar la barra
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 px-6 flex justify-between items-center z-[999] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavItem icon={Home} label="Inicio" path="/" />
      <NavItem icon={Search} label="Buscar" path="/search" />
      <NavItem icon={PlusCircle} label="Publicar" path="/publish" />
      
      {/* AI Chat Button (Replaces Favorites) */}
      <Drawer open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DrawerTrigger asChild>
           <button className="flex flex-col items-center justify-center gap-1 min-w-[3.5rem] text-indigo-500">
              <Sparkles className="h-6 w-6 fill-indigo-100" strokeWidth={2} />
              <span className="text-[10px] font-bold text-indigo-600">IA</span>
           </button>
        </DrawerTrigger>
        <DrawerContent className="h-[80vh] flex flex-col rounded-t-[2rem]">
           <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mt-4 mb-2" />
           <DrawerHeader className="text-left border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-indigo-600" />
                 </div>
                 <div>
                    <DrawerTitle className="text-lg font-bold">Asistente ServiAPP</DrawerTitle>
                    <DrawerDescription className="text-xs">
                        Búsqueda inteligente con IA + Google Places
                    </DrawerDescription>
                 </div>
              </div>
           </DrawerHeader>

           <div className="flex-1 bg-gray-50 overflow-hidden relative">
              <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
                 <div className="flex flex-col gap-4 pb-4">
                    {messages.map((msg, idx) => (
                       <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm",
                            msg.role === 'user' 
                              ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" 
                              : "bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-gray-100"
                          )}>
                             {msg.role === 'assistant' ? (
                                <div className="markdown-body" dangerouslySetInnerHTML={{ 
                                   __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                                }} />
                             ) : msg.content}
                          </div>
                       </div>
                    ))}
                    {isAiLoading && (
                       <div className="flex justify-start w-full">
                          <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-2">
                             <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                             <span className="text-xs text-gray-500 font-medium">Consultando red global...</span>
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
                    placeholder="Escribe qué necesitas..."
                    className="flex-1 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500"
                    disabled={isAiLoading}
                    autoFocus={false}
                 />
                 <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!chatInput.trim() || isAiLoading}
                    className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                 >
                    <Send className="h-5 w-5" />
                 </Button>
              </form>
           </div>
        </DrawerContent>
      </Drawer>
      
      {/* Account Tab with Avatar logic */}
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