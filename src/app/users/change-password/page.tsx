"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { validatePassword } from '@/utils/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ChangePasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    } else {
      toast.error('E-mail não fornecido.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula e um caractere especial.');
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          recoveryCode,
        }),
      });

      if (response.ok) {
        localStorage.setItem('changePasswordSuccessMessage', 'Senha alterada com sucesso!');
        router.push('/login');
      } else {
        const errorData = await response.json();
        toast.error(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      toast.error('Erro ao enviar requisição');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-black">Digite sua nova senha</h1>
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
        <input
          type="password"
          placeholder="Confirme a nova Senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button type="submit" className="bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition">
          Enviar
        </button>
      </form>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ChangePasswordContent />
    </Suspense>
  );
}
