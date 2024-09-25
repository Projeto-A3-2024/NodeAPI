"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { validatePassword } from '@/utils/auth';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem.');
      return;
    }

    if (!validatePassword(password)) {
      setMessage('A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula e um caractere especial.');
      return;
    }

    try {
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          email
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Usuário criado com sucesso: ${data.user.username}`);        
        router.push("/login");
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-8 rounded shadow-md w-full max-w-sm rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-black">Criar nova conta</h1>
      <input
          type="text"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="text"
          placeholder="Nome do usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button type="submit" className="bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition">
          Criar Usuário
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
