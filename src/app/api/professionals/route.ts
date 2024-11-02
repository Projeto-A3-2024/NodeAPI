import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { authorize } from '@/middlewares/authMiddleware';

export async function POST(request: Request) {
	const authResponse = await authorize(['ADMIN'])(request);
  if (authResponse) return authResponse;
  const { username, password, email, name, specialty } = await request.json();

  if (!username || !password || !email || !name || !specialty) {
    return NextResponse.json(
      { message: 'Todos os campos são obrigatórios' },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role: 'PROFESSIONAL',
      },
    });

    const professional = await prisma.professional.create({
			data: {
				userId: user.id,
				name,
				specialty,
			},
    });

    return NextResponse.json({ message: 'Usuário criado com sucesso', user, professional});
  } catch (error : any) {
    return NextResponse.json(
      { message: 'Erro ao criar profissional', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const authResponse = await authorize(['ADMIN', 'PATIENT', 'PROFESSIONAL'])(request);
  if (authResponse) return authResponse;

  try {
    const professionals = await prisma.professional.findMany();

    return NextResponse.json({ professionals }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro ao buscar profissionais', error: error.message },
      { status: 500 }
    );
  }
}
