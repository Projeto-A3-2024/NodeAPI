import { prisma } from '@/lib/prisma';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FORGOT_PASSWORD_TEMPLATE_ID = process.env.SENDGRID_FORGOT_PASSWORD_TEMPLATE_ID;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

sgMail.setApiKey(SENDGRID_API_KEY || '');

export async function POST(req: Request) {
    const body = await req.json();
    const { email } = body;
  
    if (!email) {
      return new Response(JSON.stringify({ message: 'E-mail é obrigatório' }), {
        status: 400,
      });
    }
  
    const user = await prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      return new Response(JSON.stringify({ message: 'Usuário não encontrado' }), {
        status: 404,
      });
    }
  
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
  
    await prisma.user.update({
      where: { email },
      data: {
        recoveryCode,
        recoveryCodeExpiresAt: new Date(Date.now() + 3600000),
      },
    });
  
    const msg = {
      to: email,
      from: SENDGRID_FROM_EMAIL!,
      templateId: SENDGRID_FORGOT_PASSWORD_TEMPLATE_ID!,
      dynamic_template_data: {
        recoveryCode,
        userName: user.username,
      },
    };
  
    try {
      await sgMail.send(msg);
      return new Response(JSON.stringify({ message: 'E-mail de recuperação enviado. Verifique sua caixa de entrada.' }), {
        status: 200,
      });
    } catch (error: any) {
      console.error('Erro ao enviar o e-mail:', error.response?.body || error);
      return new Response(JSON.stringify({ message: 'Erro ao enviar o e-mail de recuperação' }), {
        status: 500,
      });
    }
}
