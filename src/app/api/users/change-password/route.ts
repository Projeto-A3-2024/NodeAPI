import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Altera a senha de um usuário usando código de recuperação
 *     description: Permite que um usuário altere sua senha fornecendo um código de recuperação válido.
 *     requestBody:
 *       description: Dados necessários para redefinir a senha.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email do usuário.
 *                 example: "johndoe@example.com"
 *               recoveryCode:
 *                 type: string
 *                 description: Código de recuperação enviado para o email do usuário.
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 description: Nova senha para o usuário.
 *                 example: "newPassword123"
 *             required:
 *               - email
 *               - recoveryCode
 *               - password
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Senha alterada com sucesso!"
 *       404:
 *         description: Usuário não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário não encontrado"
 *       500:
 *         description: Código de recuperação incorreto ou erro interno ao alterar a senha.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao alterar senha"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 */
export async function POST(req: Request) {
    const body = await req.json();
    const { email, recoveryCode, password } = body;
  
    const user = await prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      return new Response(JSON.stringify({ message: 'Usuário não encontrado' }), {
        status: 404,
      });
    }

    if (user.recoveryCode != recoveryCode) {
        return new Response(JSON.stringify({ message: 'Código de recuperação incorreto' }), {
            status: 500,
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.update({
            where: { email },
            data: {
              password : hashedPassword,
              recoveryCode : null,
              recoveryCodeExpiresAt: null,
            },
        });
        
        return NextResponse.json(
            { message: 'Senha alterada com sucesso!' },
            { status: 200 }
        );
    } catch (error : any) {
        return NextResponse.json(
            { message: 'Erro ao alterar senha', error: error.message },
            { status: 500 }
        );
    }
}
