import { prisma } from "@/lib/prisma";
import { authorize } from "@/middlewares/authMiddleware";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

/**
 * @swagger
 * /api/appointments/{appointmentId}:
 *   put:
 *     summary: Atualiza o status de um agendamento para indisponível
 *     description: Atualiza o status de um agendamento existente para "INDISPONIVEL" e associa o agendamento ao usuário identificado no token JWT.
 *     parameters:
 *       - in: path
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
 *                   example: "Agendamento atualizado com sucesso"
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
 *         description: ID do agendamento inválido ou não fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ID do agendamento inválido ou não fornecido."
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
 *                   example: "Erro ao atualizar agendamento"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 */
export async function PUT(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  const authResponse = await authorize(['ADMIN', 'PATIENT'])(request);
  if (authResponse) return authResponse;

  const { appointmentId } = params;

  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const decodedToken: any = jwt.verify(token!, process.env.NEXT_PUBLIC_JWT_SECRET!);

    const appointment = await prisma.appointment.update({
      where: {
        id: Number(appointmentId)
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