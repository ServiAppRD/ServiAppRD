import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/profile");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/profile");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Redirect handled by auth state change
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      showError("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
          },
        },
      });
      
      if (error) throw error;
      
      showSuccess("Cuenta creada exitosamente. ¡Bienvenido!");
      
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pb-24">
      <div className="w-full max-w-md animate-accordion-down">
        
        {/* Header/Logo Section */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="ServiAPP" className="h-32 object-contain drop-shadow-sm" />
          </div>
        </div>

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-14 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
            <TabsTrigger 
              value="login" 
              className="rounded-lg text-sm font-medium data-[state=active]:bg-[#F97316] data-[state=active]:text-white transition-all h-full"
            >
              Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="rounded-lg text-sm font-medium data-[state=active]:bg-[#F97316] data-[state=active]:text-white transition-all h-full"
            >
              Registrarse
            </TabsTrigger>
          </TabsList>

          {/* LOGIN FORM */}
          <TabsContent value="login">
            <Card className="border-gray-100 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-bold text-center">¡Hola de nuevo!</CardTitle>
                <CardDescription className="text-center">Ingresa a tu cuenta para gestionar tus servicios</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="tucorreo@ejemplo.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-11 bg-white border-gray-200 focus:border-[#F97316] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <a href="#" className="text-xs text-[#F97316] hover:underline">¿Olvidaste tu contraseña?</a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 h-11 bg-white border-gray-200 focus:border-[#F97316] transition-colors"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#F97316] hover:bg-orange-600 text-white h-11 text-base font-semibold mt-4 shadow-md hover:shadow-lg transition-all" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="flex items-center gap-2">Ingresar <ArrowRight className="h-4 w-4" /></span>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REGISTER FORM */}
          <TabsContent value="register">
            <Card className="border-gray-100 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-bold text-center">Crear Cuenta</CardTitle>
                <CardDescription className="text-center">Únete hoy y conecta con profesionales</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nombre completo <span className="text-[#F97316]">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="reg-name" 
                        placeholder="Ej. Juan Pérez" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="pl-10 h-11 bg-white border-gray-200 focus:border-[#F97316] transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Correo electrónico <span className="text-[#F97316]">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="reg-email" 
                        type="email" 
                        placeholder="tucorreo@ejemplo.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-11 bg-white border-gray-200 focus:border-[#F97316] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña <span className="text-[#F97316]">*</span></Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="reg-password" 
                        type="password" 
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-10 h-11 bg-white border-gray-200 focus:border-[#F97316] transition-colors"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#F97316] hover:bg-orange-600 text-white h-11 text-base font-semibold mt-4 shadow-md hover:shadow-lg transition-all" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear cuenta gratis"}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4 px-4">
                    Al registrarte, aceptas nuestros <a href="#" className="underline hover:text-[#F97316]">Términos de Servicio</a> y <a href="#" className="underline hover:text-[#F97316]">Política de Privacidad</a>.
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default Login;