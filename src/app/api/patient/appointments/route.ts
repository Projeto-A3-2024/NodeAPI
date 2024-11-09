import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { authorize } from '@/middlewares/authMiddleware';
import { console } from 'inspector';

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
