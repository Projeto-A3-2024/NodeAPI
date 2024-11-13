import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { authorize } from '@/middlewares/authMiddleware';

/**
 * @swagger
 * /api/patient/appointments:
 *   put:
 *     summary: Atualiza o status de um agendamento para indisponível
 *     description: Atualiza o status de um agendamento existente para "INDISPONIVEL" e associa o agendamento ao usuário identificado no token JWT.
 *     parameters:
 *       - in: query
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agendamento a ser atualizado.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Agendamento criado com sucesso"
 *                 appointment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 2
 *                     status:
 *                       type: string
 *                       example: "INDISPONIVEL"
 *       400:
 *         description: Falha ao encontrar o agendamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Horário não encontrado"
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
 *         description: Erro ao atualizar o agendamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao criar agendamento"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 */
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
	const authResponse = await authorize(['ADMIN', 'PATIENT'])(request);
  if (authResponse) return authResponse;
  const appointmentId = parseInt(searchParams.get('appointmentId') || '0', 10);
  
  if (!appointmentId) {
    return NextResponse.json(
      { message: 'Horário não encontrado' },
      { status: 400 }
    );
  }

  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const decodedToken: any = jwt.verify(token!, process.env.NEXT_PUBLIC_JWT_SECRET!);

    const appointment = await prisma.appointment.update({
      where: { 
        id: appointmentId
       },
      data: {
        userId: decodedToken.userId,
        status: 'INDISPONIVEL',
      },
    });

    return NextResponse.json({ message: 'Agendamento criado com sucesso', appointment });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro ao criar agendamento', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/patient/appointments:
 *   get:
 *     summary: Lista os agendamentos disponíveis de um profissional
 *     description: Retorna uma lista de agendamentos com status "DISPONIVEL" para um profissional específico.
 *     parameters:
 *       - in: query
 *         name: professionalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do profissional cujas disponibilidades serão listadas.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos disponíveis retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       professionalId:
 *                         type: integer
 *                         example: 10
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-01T14:00:00Z"
 *                       status:
 *                         type: string
 *                         example: "DISPONIVEL"
 *       400:
 *         description: ID do profissional não fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profissional é obrigatório"
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
 *         description: Erro ao listar disponibilidade.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao listar disponibilidade"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authResponse = await authorize(['ADMIN', 'PATIENT'])(request);
  if (authResponse) return authResponse;

  const professionalId = parseInt(searchParams.get('professionalId') || '0', 10);
  if(!professionalId) {
    return NextResponse.json(
      { message: 'Profissional é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        status: 'DISPONIVEL',
      },
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro ao listar disponibilidade', error: error.message },
      { status: 500 }
    );
  }
}
