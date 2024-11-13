import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Cria um novo usuário
 *     description: Cria um novo usuário no sistema fornecendo nome de usuário, senha e e-mail.
 *     requestBody:
 *       description: Dados necessários para registrar um novo usuário.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário do novo usuário.
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 description: Senha do novo usuário.
 *                 example: "password123"
 *               email:
 *                 type: string
 *                 description: E-mail do novo usuário.
 *                 example: "johndoe@example.com"
 *             required:
 *               - username
 *               - password
 *               - email
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário criado com sucesso"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *       400:
 *         description: Campos obrigatórios não preenchidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todos os campos são obrigatórios"
 *       500:
 *         description: Erro ao criar o usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao criar usuário"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 */
export async function POST(request: Request) {
  const { username, password, email } = await request.json();

  if (!username || !password || !email) {
    return NextResponse.json(
      { message: 'Todos os campos são obrigatórios' },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });

    return NextResponse.json({ message: 'Usuário criado com sucesso', user });
  } catch (error : any) {
    return NextResponse.json(
      { message: 'Erro ao criar usuário', error: error.message },
      { status: 500 }
    );
  }
}
