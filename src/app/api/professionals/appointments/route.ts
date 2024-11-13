import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { authorize } from '@/middlewares/authMiddleware';

/**
 * @swagger
 * /api/professionals/appointments:
 *   post:
 *     summary: Cria um novo agendamento
 *     description: Cria um agendamento com status "DISPONIVEL" para um profissional autenticado, usando o horário especificado.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Dados para criação do agendamento.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentTime:
 *                 type: string
 *                 format: date-time
 *                 description: Horário do agendamento no formato ISO 8601.
 *                 example: "2024-11-01T14:00:00Z"
 *             required:
 *               - appointmentTime
 *     responses:
 *       200:
 *         description: Agendamento criado com sucesso.
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
 *                     professionalId:
 *                       type: integer
 *                       example: 10
 *                     appointmentTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-01T14:00:00Z"
 *                     status:
 *                       type: string
 *                       example: "DISPONIVEL"
 *       400:
 *         description: Horário do agendamento não fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Horário é obrigatório"
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
 *         description: Erro ao criar o agendamento.
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
export async function POST(request: Request) {
  const authResponse = await authorize(['ADMIN', 'PROFESSIONAL'])(request);
  if (authResponse) return authResponse;
  const { appointmentTime } = await request.json();

  if (!appointmentTime) {
    return NextResponse.json(
      { message: 'Horário é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const decodedToken: any = jwt.verify(token!, process.env.NEXT_PUBLIC_JWT_SECRET!);
    const professional = await prisma.professional.findUnique({
      where: { userId: decodedToken.userId }
    });

    const appointment = await prisma.appointment.create({
      data: {
        professionalId: professional!.id,
        appointmentTime: new Date(appointmentTime),
        status: 'DISPONIVEL',
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
 * /api/professionals/appointments:
 *   get:
 *     summary: Lista os agendamentos de um profissional
 *     description: Retorna uma lista de todos os agendamentos associados ao profissional autenticado.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos do profissional retornada com sucesso.
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
 *                       appointmentTime:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-01T14:00:00Z"
 *                       status:
 *                         type: string
 *                         example: "DISPONIVEL"
 *       400:
 *         description: Profissional não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profissional não encontrado"
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
 *         description: Erro ao listar agendamentos do profissional.
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
  
  const authResponse = await authorize(['ADMIN', 'PROFESSIONAL'])(request);
  if (authResponse) return authResponse;

  const token = request.headers.get('Authorization')?.split(' ')[1];
    const decodedToken: any = jwt.verify(token!, process.env.NEXT_PUBLIC_JWT_SECRET!);
    const professional = await prisma.professional.findUnique({
      where: { userId: decodedToken.userId }
    });

    if(professional == null || undefined) {
      return NextResponse.json(
        { message: 'Profissional não encontrado' },
        { status: 400 }
      );
    }

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: professional.id
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro ao listar disponibilidade', error: error.message },
      { status: 500 }
    );
  }
}
