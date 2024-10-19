import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET!;

export const authorize = (roles: ('ADMIN' | 'PROFESSIONAL' | 'PATIENT')[]) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken: any = jwt.verify(token, SECRET_KEY);

      if (!roles.includes(decodedToken.role)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      (req as any).user = decodedToken;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  };
};
