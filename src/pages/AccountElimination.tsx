import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, Trash2, AlertTriangle, ShieldCheck, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AccountElimination = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlus, setIsPlus] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showError("Debes iniciar sesión para gestionar tu cuenta");
        navigate("/login");
        return;
      }
      setSession(session);

      // Check if user is Plus
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_plus')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        setIsPlus(profile.is_plus || false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleDeleteAccount = async () => {
    if (isPlus) return; 

    if (!confirm("¿Estás seguro de que quieres eliminar tu cuenta de forma permanente?")) return;

    setIsDeleting(true);
    try {
       const { error } = await supabase.functions.invoke('delete-user');
       
       if (error) throw new Error("No se pudo completar la eliminación.");

       await supabase.auth.signOut();
       navigate('/');
       showSuccess("Tu cuenta ha sido eliminada.");
       
    } catch (error: any) {
       console.error(error);
       showError("Error al eliminar cuenta.");
    } finally {
       setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#F97316]" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-red-100">
        <CardHeader className="text-center relative">
          <Button variant="ghost" size="icon" className="absolute left-0 top-0" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Eliminar Cuenta</CardTitle>
          <CardDescription>
            Esta acción es irreversible.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isPlus ? (
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center space-y-3">
               <div className="flex justify-center">
                  <ShieldCheck className="h-8 w-8 text-[#0239c7]" />
               </div>
               <h3 className="font-bold text-gray-900">Suscripción Activa</h3>
               <p className="text-sm text-gray-600">
                  Tienes un plan <strong>ServiAPP Plus</strong> activo. Debes cancelar tu suscripción antes de poder eliminar tu cuenta.
               </p>
               <Button 
                 onClick={() => navigate('/profile?view=my-plan')}
                 className="w-full bg-[#0239c7] hover:bg-[#022b9e]"
               >
                 Ir a mi plan
               </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 text-left">
                  Perderás acceso a tus servicios publicados, reseñas y favoritos.
                </p>
              </div>
              
              <div className="text-sm text-gray-500 text-center">
                Cuenta: <span className="font-medium text-gray-900">{session?.user.email}</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {!isPlus && (
            <Button 
              variant="destructive" 
              className="w-full h-12 bg-red-600 hover:bg-red-700"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin mr-2" /> : "Confirmar Eliminación"}
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => navigate('/')}
          >
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountElimination;