import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';


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
    return new Response(JSON.stringify({ message: 'Usuário não encontrado' }), {
      status: 401,
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return new Response(JSON.stringify({ message: 'Senha incorreta' }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify({ message: 'Login efetuado com sucesso', username }), {
    status: 200,
  });
}
