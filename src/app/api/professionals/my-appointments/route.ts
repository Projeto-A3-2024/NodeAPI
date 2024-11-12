import { prisma } from "@/lib/prisma";
import { authorize } from "@/middlewares/authMiddleware";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  const authResponse = await authorize(['ADMIN', 'PROFESSIONAL'])(request);
  if (authResponse) return authResponse;

  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const decodedToken: any = jwt.verify(token!, process.env.NEXT_PUBLIC_JWT_SECRET!);

    const professional = await prisma.professional.findUnique({
      where: {
        userId: decodedToken.userId
      }
    });

    if (professional == null) {
      return NextResponse.json(
        { message: 'Erro ao listar agendamentos' },
        { status: 500 }
      );
    }

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