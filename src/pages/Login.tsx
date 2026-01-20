import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    // Inicializar Google Auth con el Client ID proporcionado
    GoogleAuth.initialize({
      clientId: '679855184605-fuv9vrv8jldmi9ge17795opc1e4odnnf.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/profile");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/profile");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      
      // 1. Solicitar inicio de sesión al plugin nativo (o web)
      const response = await GoogleAuth.signIn();
      
      // 2. Obtener el idToken de la respuesta de Google
      const { idToken } = response.authentication;

      if (idToken) {
        // 3. Intercambiar el token de Google por una sesión de Supabase
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) throw error;
        // La redirección la maneja el onAuthStateChange
      } else {
        throw new Error("No se recibió el token de Google");
      }
      
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      // Ignoramos el error si el usuario canceló el modal
      if (error?.error !== 'popup_closed_by_user' && error?.message !== 'cancelled') {
         showError("Error al iniciar con Google");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

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
      console.error("Login error:", error);
      if (error.message.includes("Invalid login credentials")) {
        showError("Correo o contraseña incorrectos");
      } else {
        showError(error.message);
      }
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user && !data.session) {
        showSuccess("Cuenta creada. Por favor revisa tu correo para verificar la cuenta.");
      } else {
        showSuccess("Cuenta creada exitosamente. ¡Bienvenido!");
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message.includes("User already registered")) {
        showError("Este correo ya está registrado.");
      } else {
        showError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Componente del botón de Google para reutilizar
  const GoogleButton = ({ text }: { text: string }) => (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">O continúa con</span>
        </div>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full h-11 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium relative shadow-sm"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
      >
        {googleLoading ? (
           <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        ) : (
           <>
             <img src="/google-logo.png" alt="Google" className="h-5 w-5 absolute left-4" />
             {text}
           </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pb-24 relative">
      
      {/* Botón de Volver */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4 text-gray-500 hover:text-[#F97316] hover:bg-orange-50 transition-colors z-10"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

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
                    disabled={loading || googleLoading}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="flex items-center gap-2">Ingresar <ArrowRight className="h-4 w-4" /></span>}
                  </Button>

                  {/* Google Login Button */}
                  <GoogleButton text="Iniciar con Google" />

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
                    disabled={loading || googleLoading}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear cuenta gratis"}
                  </Button>
                  
                  {/* Google Login Button */}
                  <GoogleButton text="Registrarse con Google" />

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