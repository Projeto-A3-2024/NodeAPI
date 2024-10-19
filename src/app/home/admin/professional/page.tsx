"use client";
import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateProfessionalPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const response = await fetch('/api/professionals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username,
        password,
        email,
        name,
        specialty,
      }),
    });

    if (response.ok) {
      toast.success('Profissional criados com sucesso');
    } else {
      const errorData = await response.json();
      toast.error(`Erro ao criar profissional: ${errorData.error}`)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-black">Criar Profissional</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-8 rounded shadow-md w-full max-w-sm">
        <input
          type="text"
          placeholder="Nome de usuário"
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
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="text"
          placeholder="Nome do Profissional"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="text"
          placeholder="Especialidade"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button type="submit" className="bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition">
          Criar Profissional
        </button>
      </form>
    </div>
  );
}
