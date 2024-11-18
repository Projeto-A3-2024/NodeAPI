import { NextResponse } from 'next/server';
import { authorize } from '@/middlewares/authMiddleware';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/appointments/professionals/{professionalId}:
 *   post:
 *     summary: Cria um novo agendamento
 *     description: Cria um agendamento com status "DISPONIVEL" para o profissional especificado usando o horário fornecido.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: professionalId
 *         required: true
 *         description: ID do profissional para quem o agendamento será criado.
 *         schema:
 *           type: integer
 *           example: 10
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
export async function POST(
  request: Request,
  { params }: { params: { professionalId: string } }
) {
  const authResponse = await authorize(['ADMIN', 'PROFESSIONAL'])(request);
  if (authResponse) return authResponse;

  const { professionalId } = params;

  const { appointmentTime } = await request.json();
  if (!appointmentTime) {
    return NextResponse.json(
      { message: 'Horário é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        professionalId: Number(professionalId),
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
 * /api/appointments/professionals/{professionalId}:
 *   get:
 *     summary: Lista os agendamentos de um profissional
 *     description: Retorna todos os agendamentos de um profissional especificado pelo ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: professionalId
 *         required: true
 *         description: ID do profissional cujos agendamentos serão listados.
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Lista de agendamentos retornada com sucesso.
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
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 20
 *                           name:
 *                             type: string
 *                             example: "João Silva"
 *       404:
 *         description: Nenhum agendamento encontrado para o profissional.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nenhum agendamento encontrado para este profissional."
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
 *         description: Erro ao buscar os agendamentos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao buscar agendamentos"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 */
export async function GET(
  request: Request,
  { params }: { params: { professionalId: string } }
) {
  const authResponse = await authorize(['ADMIN'])(request);
  if (authResponse) return authResponse;

  const { professionalId } = params;

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: Number(professionalId),
      },
      include: {
        user: true,
      },
    });

    if (!appointments || appointments.length === 0) {
      return NextResponse.json(
        { message: 'Nenhum agendamento encontrado para este profissional.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro ao buscar agendamentos', error: error.message },
      { status: 500 }
    );
  }
}
