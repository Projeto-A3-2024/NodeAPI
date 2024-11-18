"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { IoLogOutOutline } from "react-icons/io5";

export default function ProfessionalHome() {
  const router = useRouter();
  useAuth('PROFESSIONAL');

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleGetMyAppointments = () => {
    router.push("/home/professional/appointments");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">

      <h1 className="text-3xl font-bold mb-4 absolute top-4">Bem-vindo!</h1>
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-black text-white rounded px-4 py-2 hover:bg-red-600 transition flex items-center space-x-2"
      >
        <IoLogOutOutline className="text-lg" /> { }
      </button>

      <section className="p-8 w-full max-w-xl text-center grid grid-cols-1 gap-4">
        <button
          onClick={handleGetMyAppointments}
          className="bg-blue-500 text-white rounded px-4 py-8 hover:bg-blue-600 transition mb-4 text-xl font-bold leading-[27px] text-left flex justify-between items-center"
          style={{ background: '#00D6E1' }}
        >
          Minha agenda
          <Image
            src="/icons/minha-agenda.svg"
            alt="Minha agenda"
            width={50}
            height={50}
            className="ml-2"
          />
        </button>
      </section>
    </main>
  );
}
