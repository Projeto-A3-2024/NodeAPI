"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET;
if (!SECRET_KEY) {
    throw new Error('JWT_SECRET não está definido. Defina uma chave secreta em suas variáveis de ambiente.');
}  

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  const decodeJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(escape(window.atob(base64)));
    return JSON.parse(jsonPayload);
  };

  useEffect(() => {    
    const token = localStorage.getItem("token");
    
    if (token) {
      try {
        const decodedToken = decodeJwt(token);
        setUsername(decodedToken.username);

        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Erro ao verificar o token:", error);
        localStorage.removeItem("token");
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Bem-vindo, {username || "Usuário"}!</h1>
        <p className="text-gray-700 mb-8">Esta é a página inicial do seu aplicativo Next.js.</p>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
