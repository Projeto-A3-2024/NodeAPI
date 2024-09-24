import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const body = await req.json();
    const { email, recoveryCode, password } = body;
  
    const user = await prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      return new Response(JSON.stringify({ message: 'Usuário não encontrado' }), {
        status: 404,
      });
    }

    if (user.recoveryCode != recoveryCode) {
        return new Response(JSON.stringify({ message: 'Código de recuperação incorreto' }), {
            status: 500,
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.update({
            where: { email },
            data: {
              password : hashedPassword,
              recoveryCode : null,
              recoveryCodeExpiresAt: null,
            },
        });
        
        return NextResponse.json(
            { message: 'Senha alterada com sucesso!' },
            { status: 200 }
        );
    } catch (error : any) {
        return NextResponse.json(
            { message: 'Erro ao alterar senha', error: error.message },
            { status: 500 }
        );
    }
}
