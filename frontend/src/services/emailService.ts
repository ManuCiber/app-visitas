import { supabase } from '../lib/supabase';

export const emailService = {
  /**
   * Envía un correo transaccional de bienvenida y confirmación de aprobación de cuenta
   * a través de la función de Supabase conectada con Resend.
   */
  enviarAprobacionCuenta: async (data: {
    nombre: string;
    correo: string;
    appUrl?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.functions.invoke('send-approval-email', {
        body: {
          nombre: data.nombre,
          correo: data.correo,
          appUrl: data.appUrl || window.location.origin,
        },
      });

      if (error) {
        console.warn('Aviso: No se pudo enviar el correo vía Supabase Edge Function:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Fallo al invocar el envío de correo de aprobación:', err?.message);
      return { success: false, error: err?.message };
    }
  },
};
