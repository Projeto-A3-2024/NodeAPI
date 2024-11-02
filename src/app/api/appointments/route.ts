import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { authorize } from '@/middlewares/authMiddleware';

export async function POST(request: Request) {
	const authResponse = await authorize(['ADMIN', 'PATIENT'])(request);
  if (authResponse) return authResponse;
  const { professionalId, appointmentTime } = await request.json();
  
  if (!professionalId || !appointmentTime) {
    return NextResponse.json(
      { message: 'Profissional e horário são obrigatórios' },
      { status: 400 }
    );
  }

  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const decodedToken: any = jwt.verify(token!, process.env.NEXT_PUBLIC_JWT_SECRET!);

    const appointment = await prisma.appointment.create({
      data: {
        professionalId,
        userId: decodedToken.userId,
        appointmentTime: new Date(appointmentTime),
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
