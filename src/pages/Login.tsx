import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/profile");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pb-24">
      <div className="w-full max-w-md">
        
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          
          {/* Header/Logo Section */}
          <div className="text-center space-y-2 mb-8">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="ServiAPP" className="h-16 object-contain" />
            </div>
            <p className="text-gray-500 text-sm">Ingresa para gestionar tus servicios</p>
          </div>

          {/* Auth Component */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#F97316',
                    brandAccent: '#ea580c',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f3f4f6',
                    defaultButtonBackgroundHover: '#e5e7eb',
                    inputBackground: 'white',
                    inputBorder: '#e2e8f0',
                    inputBorderHover: '#F97316',
                    inputBorderFocus: '#F97316',
                  },
                  radii: {
                    borderRadiusButton: '9999px', // Pill shaped buttons
                    inputBorderRadius: '1rem',      // Rounded inputs
                  },
                  space: {
                    inputPadding: '1.2rem', // Taller inputs
                    buttonPadding: '1.2rem', // Taller buttons
                  }
                },
              },
              className: {
                button: 'font-bold shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]',
                input: 'font-medium text-base',
                label: 'font-medium text-gray-700 ml-1 mb-1.5',
                container: 'gap-4',
                anchor: 'text-[#F97316] hover:text-orange-700 font-medium',
              }
            }}
            providers={[]}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  button_label: 'Iniciar sesión',
                  email_input_placeholder: 'ejemplo@correo.com',
                  password_input_placeholder: '••••••••',
                },
                sign_up: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  button_label: 'Crear cuenta',
                  link_text: '¿No tienes cuenta? Regístrate gratis',
                },
                forgotten_password: {
                  link_text: '¿Olvidaste tu contraseña?',
                  button_label: 'Enviar instrucciones',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;