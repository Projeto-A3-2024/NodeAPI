import { prisma } from '@/lib/prisma';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FORGOT_PASSWORD_TEMPLATE_ID = process.env.SENDGRID_FORGOT_PASSWORD_TEMPLATE_ID;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

sgMail.setApiKey(SENDGRID_API_KEY || '');

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Envia um código de recuperação de senha por e-mail
 *     description: Envia um e-mail com um código de recuperação para redefinir a senha do usuário.
 *     requestBody:
 *       description: Dados necessários para enviar o e-mail de recuperação de senha.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: E-mail do usuário para o qual o código de recuperação será enviado.
 *                 example: "johndoe@example.com"
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: E-mail de recuperação enviado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "E-mail de recuperação enviado. Verifique sua caixa de entrada."
 *       400:
 *         description: E-mail não informado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "E-mail é obrigatório"
 *       404:
 *         description: Usuário não encontrado com o e-mail fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário não encontrado"
 *       500:
 *         description: Erro ao enviar o e-mail de recuperação.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao enviar o e-mail de recuperação"
 */
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
