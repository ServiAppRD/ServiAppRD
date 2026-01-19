import { toast } from "sonner";

export const showSuccess = (message: string) => {
  // Silenciado por configuración de usuario: solo mostrar errores.
  console.log("Acción exitosa:", message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};