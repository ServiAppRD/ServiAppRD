import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, Mail, Lock, User, ArrowRight, ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- CONFIGURACIÓN DE GOOGLE ---
// 1. Ve a https://console.cloud.google.com/
// 2. Crea un proyecto y ve a "APIs & Services" > "Credentials"
// 3. Crea un "OAuth Client ID" (Tipo: Web Application)
// 4. En "Authorized JavaScript origins", PEGA TU URL ACTUAL: https://tudominio.com (sin barra al final)
// 5. Copia el Client ID y pégalo abajo:
const GOOGLE_CLIENT_ID = '679855184605-fuv9vrv8jldmi9ge17795opc1e4odnnf.apps.googleusercontent.com'; 
// -------------------------------

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [googleErrorDetail, setGoogleErrorDetail] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    // Inicializar Google Auth
    GoogleAuth.initialize({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['profile', 'email'],
      grantOfflineAccess: false,
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
    setGoogleErrorDetail(null);
    try {
      setGoogleLoading(true);
      console.log("Iniciando login con Google en origen:", window.location.origin);
      
      const response = await GoogleAuth.signIn();
      console.log("Respuesta Google:", response);
      
      const { idToken } = response.authentication;

      if (idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) throw error;
      } else {
        throw new Error("No se recibió el token de Google.");
      }
      
    } catch (error: any) {
      console.error("Google Auth Error Full:", error);
      
      let msg = "Error desconocido";
      if (typeof error === 'string') msg = error;
      else if (error?.message) msg = error.message;
      else if (error?.error) msg = JSON.stringify(error.error);
      
      // --- MANEJO DE ERRORES COMUNES ---

      // 1. Popup cerrado (común en iframes)
      if (msg.includes('popup_closed_by_user')) {
         setGoogleErrorDetail(`
           Google cerró la ventana por seguridad (posiblemente por estar en un iframe).
           INTENTA ABRIR LA APP EN UNA PESTAÑA NUEVA.
         `);
         return;
      }

      // 2. Origen no autorizado (El error que tienes ahora)
      if (msg.includes('Not a valid origin') || msg.includes('registered origin')) {
         setGoogleErrorDetail(`
           TU URL NO ESTÁ AUTORIZADA EN GOOGLE CLOUD.
           
           URL Actual: ${window.location.origin}
           
           SOLUCIÓN:
           1. Necesitas tu propio CLIENT ID (el actual es de ejemplo y no puedes editarlo).
           2. Crea uno en Google Cloud Console.
           3. Agrega "${window.location.origin}" en "Authorized JavaScript origins".
           4. Reemplaza la variable GOOGLE_CLIENT_ID en este archivo.
         `);
         return;
      }

      showError(`Error Google: ${msg}`);
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
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4 text-gray-500 hover:text-[#F97316] hover:bg-orange-50 transition-colors z-10"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <a 
        href={window.location.href} 
        target="_blank" 
        rel="noreferrer"
        className="absolute top-4 right-4 md:hidden text-xs text-gray-400 flex items-center gap-1 hover:text-[#F97316]"
        title="Abrir en nueva pestaña"
      >
        <ExternalLink className="h-4 w-4" />
      </a>

      <div className="w-full max-w-md animate-accordion-down space-y-4">
        
        <div className="text-center space-y-2 mb-4">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="ServiAPP" className="h-32 object-contain drop-shadow-sm" />
          </div>
        </div>

        {/* Mensaje de Error de Diagnóstico */}
        {googleErrorDetail && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuración de Google Requerida</AlertTitle>
            <AlertDescription className="text-xs whitespace-pre-line mt-2 font-mono break-all">
              {googleErrorDetail}
            </AlertDescription>
          </Alert>
        )}

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

                  <GoogleButton text="Iniciar con Google" />

                </form>
              </CardContent>
            </Card>
          </TabsContent>

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