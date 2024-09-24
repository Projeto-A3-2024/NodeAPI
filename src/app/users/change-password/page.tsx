"use client";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ChangePassword() {
  const [password, setPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
        setEmail(emailFromQuery);
    } else {
        setMessage('E-mail não fornecido.');
    }
  }, [searchParams]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
    const response = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        recoveryCode
      }),
    });

    if (response.ok) {          
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
      <h1 className="text-2xl font-bold mb-6 text-black">Recuperação de senha</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-8 rounded shadow-md w-full max-w-sm">
        <input
          type="text"
          placeholder="Código de recuperação"
          value={recoveryCode}
          onChange={(e) => setRecoveryCode(e.target.value)}
          className="border p-2 rounded text-black"
          required
          />
        <input
          type="password"
          placeholder="Nova Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
          />
        <button type="submit" className="bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition">
        Enviar
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
