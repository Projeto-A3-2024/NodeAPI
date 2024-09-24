import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { username, password, email } = await request.json();

  if (!username || !password || !email) {
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
      },
    });

    return NextResponse.json({ message: 'Usuário criado com sucesso', user });
  } catch (error : any) {
    return NextResponse.json(
      { message: 'Erro ao criar usuário', error: error.message },
      { status: 500 }
    );
  }
}
