import { Home, PlusCircle, Search, User, Crown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPlus, setIsPlus] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        const { data } = await supabase.from('profiles').select('avatar_url, is_plus').eq('id', session.user.id).single();
        if (data) {
           setAvatarUrl(data.avatar_url);
           setIsPlus(data.is_plus || false);
        }
      }
    };

    fetchProfile();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) fetchProfile();
        else {
            setAvatarUrl(null);
            setIsPlus(false);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const shouldHideNavbar = 
    ["/publish", "/login", "/account-elimination"].includes(location.pathname) || 
    location.pathname.startsWith("/service/") ||
    location.pathname.startsWith("/edit-service/") ||
    location.pathname.startsWith("/user/");

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