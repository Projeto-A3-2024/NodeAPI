"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        router.push("/home");
      } else {
        const errorData = await response.json();
        setMessage(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      setMessage('Erro ao enviar requisição');
      console.error('Erro:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <Image
        className="mb-8"
        src="https://nextjs.org/icons/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold text-center text-black">Login</h1>
        <input
          type="text"
          placeholder="Nome do usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded text-black"
          required
          color="black"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition"
        >
          Entrar
        </button>
        <div className="mt-4 flex flex-col space-y-2 text-left">
          <Link href="/users/forgot-password" className="text-blue-500 hover:underline">
            Esqueceu sua senha?
          </Link>
          <Link href="/users/signup" className="text-blue-500 hover:underline">
            Cadastrar um novo usuário
          </Link>
        </div>        
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
