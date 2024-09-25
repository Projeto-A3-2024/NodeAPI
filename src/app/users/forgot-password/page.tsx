"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email
        }),
      });

      if (response.ok) {
        setMessage(`E-mail de recuperação enviado`);
        setEmail('');
        router.push(`/users/change-password?email=${encodeURIComponent(email)}`);
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
      <h1 className="text-2xl font-bold mb-6 text-black">Digite seu e-mail</h1>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
