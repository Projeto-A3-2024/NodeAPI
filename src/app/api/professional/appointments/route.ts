import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { authorize } from '@/middlewares/authMiddleware';

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
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro ao listar disponibilidade', error: error.message },
      { status: 500 }
    );
  }
}
