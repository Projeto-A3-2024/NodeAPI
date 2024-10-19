import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET!;

export const authorize = (roles: ('ADMIN' | 'PROFESSIONAL' | 'PATIENT')[]) => {
  return async (request: Request) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken: any = jwt.verify(token, SECRET_KEY);

      if (!roles.includes(decodedToken.role)) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
      }

      (request as any).user = decodedToken;
      return null;
    } catch (error) {
      return NextResponse.json({ message: 'Token inválido ou expirado' }, { status: 401 });
    }
  };
};
