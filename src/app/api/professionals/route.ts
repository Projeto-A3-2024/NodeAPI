import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { authorize } from '@/middlewares/authMiddleware';

/**
 * @swagger
 * /api/professionals:
 *   post:
 *     summary: Cria um novo profissional
 *     description: Cria um usuário com o papel de "PROFESSIONAL" e os dados adicionais de profissional.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Dados necessários para criar o novo profissional.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário do novo profissional.
 *                 example: "newprofessional"
 *               password:
 *                 type: string
 *                 description: Senha para o profissional.
 *                 example: "password123"
 *               email:
 *                 type: string
 *                 description: Email do profissional.
 *                 example: "newprofessional@example.com"
 *               name:
 *                 type: string
 *                 description: Nome completo do profissional.
 *                 example: "John Doe"
 *               specialty:
 *                 type: string
 *                 description: Especialidade do profissional.
 *                 example: "Cardiologia"
 *             required:
 *               - username
 *               - password
 *               - email
 *               - name
 *               - specialty
 *     responses:
 *       200:
 *         description: Profissional criado com sucesso.
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
 *                       example: "newprofessional"
 *                     email:
 *                       type: string
 *                       example: "newprofessional@example.com"
 *                     role:
 *                       type: string
 *                       example: "PROFESSIONAL"
 *                 professional:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     specialty:
 *                       type: string
 *                       example: "Cardiologia"
 *       400:
 *         description: Dados obrigatórios ausentes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todos os campos são obrigatórios"
 *       401:
 *         description: Usuário não autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Erro ao criar o profissional.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao criar profissional"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 */
export async function POST(request: Request) {
	const authResponse = await authorize(['ADMIN'])(request);
  if (authResponse) return authResponse;
  const { username, password, email, name, specialty } = await request.json();

  if (!username || !password || !email || !name || !specialty) {
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
        role: 'PROFESSIONAL',
      },
    });

    const professional = await prisma.professional.create({
			data: {
				userId: user.id,
				name,
				specialty,
			},
    });

    return NextResponse.json({ message: 'Usuário criado com sucesso', user, professional});
  } catch (error : any) {
    return NextResponse.json(
      { message: 'Erro ao criar profissional', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/professionals:
 *   get:
 *     summary: Lista todos os profissionais
 *     description: Retorna uma lista de todos os profissionais registrados.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de profissionais retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 professionals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: integer
 *                         example: 10
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       specialty:
 *                         type: string
 *                         example: "Cardiologia"
 *       401:
 *         description: Usuário não autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Erro ao buscar profissionais.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao buscar profissionais"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 */
export async function GET(request: Request) {
  const authResponse = await authorize(['ADMIN', 'PATIENT', 'PROFESSIONAL'])(request);
  if (authResponse) return authResponse;

  try {
    const professionals = await prisma.professional.findMany();

    return NextResponse.json({ professionals }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro ao buscar profissionais', error: error.message },
      { status: 500 }
    );
  }
}
