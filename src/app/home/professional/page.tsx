"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProfessionalHome() {
  const router = useRouter();
  useAuth('PROFESSIONAL');

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleCreateAppointment = () => {
    router.push("/home/professional/appointments");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Bem-vindo!</h1>
        <p className="text-gray-700 mb-8">Esta é a página inicial do seu aplicativo Next.js.</p>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition"
        >
          Logout
        </button>
        <button
          onClick={handleCreateAppointment}
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition mb-4"
        >
          Disponibilidade
        </button>
      </div>
    </div>
  );
}