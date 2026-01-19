// Sistema de notificaciones deshabilitado por solicitud.
// Los mensajes solo se registrarán en la consola.

export const showSuccess = (message: string) => {
  console.log("[Success]:", message);
};

export const showError = (message: string) => {
  console.error("[Error]:", message);
};

export const showLoading = (message: string) => {
  console.log("[Loading]:", message);
  return "dummy-id"; // Retornamos un ID ficticio para mantener compatibilidad de tipos
};

export const dismissToast = (toastId: string) => {
  // No hacer nada
};