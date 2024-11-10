import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET!;

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Realiza o login de um usuário
 *     description: Autentica o usuário e retorna um token JWT válido por 3 horas.
 *     requestBody:
 *       description: Credenciais de login do usuário.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário do usuário.
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 description: Senha do usuário.
 *                 example: "password123"
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Login bem-sucedido e token gerado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login efetuado com sucesso"
 *                 token:
 *                   type: string
 *                   example: "jwt_token_example"
 *       400:
 *         description: Nome de usuário ou senha faltando.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Username e password são obrigatórios"
 *       401:
 *         description: Nome de usuário ou senha incorretos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário ou senha podem estar incorretos"
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return new Response(JSON.stringify({ message: 'Username e password são obrigatórios' }), {
      status: 400,
    });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return new Response(JSON.stringify({ message: 'Usuário ou senha podem estar incorretos' }), {
      status: 401,
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return new Response(JSON.stringify({ message: 'Usuário ou senha podem estar incorretos' }), {
      status: 401,
    });
  }

  const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, SECRET_KEY, {
    expiresIn: '3h',
  });

  return new Response(JSON.stringify({ message: 'Login efetuado com sucesso', token }), {
    status: 200,
  });
}
