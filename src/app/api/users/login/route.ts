import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return new Response(JSON.stringify({ message: 'Username e password são obrigatórios' }), {
      status: 400,
    });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return new Response(JSON.stringify({ message: 'Usuário ou senha podem estar incorretos' }), {
      status: 401,
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return new Response(JSON.stringify({ message: 'Usuário ou senha podem estar incorretos' }), {
      status: 401,
    });
  }

  const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, SECRET_KEY, {
    expiresIn: '3h',
  });

  return new Response(JSON.stringify({ message: 'Login efetuado com sucesso', token }), {
    status: 200,
  });
}
