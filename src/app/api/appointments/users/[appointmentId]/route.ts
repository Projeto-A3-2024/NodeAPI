import { prisma } from "@/lib/prisma";
import { authorize } from "@/middlewares/authMiddleware";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/appointments/users/{appointmentId}:
 *   put:
 *     summary: Remove um agendamento de um paciente e torna o horário disponível
 *     description: Atualiza o status de um agendamento, removendo-o de um paciente e tornando-o disponível novamente.
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
 *         description: Agendamento removido e status alterado para disponível com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Agendamento removido e status alterado para DISPONIVEL com sucesso"
 *                 appointment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     professionalId:
 *                       type: integer
 *                       example: 10
 *                     status:
 *                       type: string
 *                       example: "DISPONIVEL"
 *       400:
 *         description: Agendamento não encontrado ou falha na atualização.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Agendamento não encontrado"
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

    const appointment = await prisma.appointment.update({
      where: {
        id: Number(appointmentId)
      },
      data: {
        userId: null,
        status: 'DISPONIVEL',
      },
    });

    return NextResponse.json({ message: 'Agendamento removido e status alterado para DISPONIVEL com sucesso', appointment });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro ao atualizar agendamento', error: error.message },
      { status: 500 }
    );
  }
}