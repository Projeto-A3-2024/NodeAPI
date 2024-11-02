"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
        toast.success('E-mail de recuperação enviado');
        setEmail('');
        setTimeout(() => {
          router.push(`/users/change-password?email=${encodeURIComponent(email)}`);
        }, 3000);
      } else {
        const errorData = await response.json();
        toast.error(`Erro: ${errorData.message}`);
      }
      
    } catch (error) {
      toast.error(`Erro: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-8 rounded shadow-md w-full max-w-sm rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-black">Digite seu e-mail</h1>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition"
          disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
