import { prisma } from "@/lib/prisma";
import { authorize } from "@/middlewares/authMiddleware";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

/**
 * @swagger
 * /api/patient/my-appointments:
 *   get:
 *     summary: Lista os agendamentos do usuário logado
 *     description: Retorna uma lista de agendamentos associados ao usuário logado, com base no token JWT.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos do usuário retornada com sucesso.
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
 *                       userId:
 *                         type: integer
 *                         example: 5
 *                       professionalId:
 *                         type: integer
 *                         example: 10
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-01T14:00:00Z"
 *                       status:
 *                         type: string
 *                         example: "CONFIRMADO"
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
 *         description: Erro ao listar os agendamentos do usuário.
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
  const authResponse = await authorize(['ADMIN', 'PATIENT'])(request);
  if (authResponse) return authResponse;

  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const decodedToken: any = jwt.verify(token!, process.env.NEXT_PUBLIC_JWT_SECRET!);

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: decodedToken.userId
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