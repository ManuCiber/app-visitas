import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend';

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'MediCare <onboarding@resend.dev>';
const resend = new Resend(resendApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generarPlantillaAprobacion(nombre: string, loginUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MediCare - Cuenta Aprobada</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 36px 24px; text-align: center; }
    .badge { display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 6px 14px; border-radius: 9999px; color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 32px; line-height: 1.6; }
    .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 15px; color: #475569; margin-bottom: 24px; }
    .success-card { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 18px; border-radius: 8px; margin: 24px 0; }
    .success-card-title { font-size: 15px; font-weight: 600; color: #065f46; margin-bottom: 4px; }
    .success-card-desc { font-size: 14px; color: #047857; margin: 0; }
    .features-list { margin: 28px 0; padding: 0; list-style: none; }
    .features-item { display: flex; align-items: flex-start; margin-bottom: 14px; font-size: 14px; color: #334155; }
    .features-icon { margin-right: 12px; font-size: 18px; line-height: 1; }
    .cta-container { text-align: center; margin: 36px 0 24px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; padding: 14px 34px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">✓ CUENTA VERIFICADA</div>
      <h1>¡Bienvenido a MediCare!</h1>
    </div>

    <div class="content">
      <div class="greeting">Hola, ${nombre} 👋</div>
      <p class="intro">
        Nos complace informarte que el Administrador General ha <strong>revisado y aprobado tu cuenta</strong> de Visitador Médico. Tu acceso se encuentra plenamente habilitado.
      </p>

      <div class="success-card">
        <div class="success-card-title">🎉 Estado: Activa y Aprobada</div>
        <p class="success-card-desc">Ya puedes iniciar sesión con tu correo y contraseña registrados para acceder a todas las herramientas de tu zona de trabajo.</p>
      </div>

      <p style="font-weight: 600; color: #1e293b; margin-top: 24px; margin-bottom: 12px;">Lo que puedes hacer ahora:</p>
      <ul class="features-list">
        <li class="features-item">
          <span class="features-icon">👨‍⚕️</span>
          <span><strong>Gestionar tu Directorio:</strong> Registrar y consultar los médicos asignados a tu cartera.</span>
        </li>
        <li class="features-item">
          <span class="features-icon">🏥</span>
          <span><strong>Centros Médicos:</strong> Vincular hospitales, clínicas y consultorios a tus doctores.</span>
        </li>
        <li class="features-item">
          <span class="features-icon">🔒</span>
          <span><strong>Aislamiento Seguro:</strong> Tus datos y médicos están protegidos y asignados exclusivamente a tu cuenta.</span>
        </li>
      </ul>

      <div class="cta-container">
        <a href="${loginUrl}" class="btn">Ingresar a la Plataforma</a>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px;">
        Enlace directo: <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>MediCare</strong> - Sistema Integral de Gestión de Visitas Médicas</p>
      <p style="margin: 0;">© 2026 MediCare Inc. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      throw new Error('Variable de entorno RESEND_API_KEY no configurada en Supabase Edge Functions');
    }

    const { nombre, correo, appUrl } = await req.json();

    if (!correo || !nombre) {
      return new Response(
        JSON.stringify({ error: 'Parámetros requeridos faltantes: correo y nombre' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const loginUrl = appUrl || 'http://localhost:5173';
    const html = generarPlantillaAprobacion(nombre, loginUrl);

    const { data, error } = await resend.emails.send({
      from: resendFromEmail,
      to: [correo],
      subject: '🎉 ¡Tu cuenta en MediCare ha sido aprobada!',
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
