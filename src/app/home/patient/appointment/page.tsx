"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Professional {
  id: number;
  name: string;
  specialty: string;
}

export default function ProfessionalList() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  useAuth('PATIENT');

  const fetchProfessionals = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/professionals', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        toast.error('Erro ao buscar profissionais');
        return null;
      }
      const data = await response.json();
      setProfessionals(data.professionals);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async () => {
    setIsModalOpen(true);
    setLoading(true);
    await fetchProfessionals();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
    closeModal();
  };

  const handleScheduleAppointment = async () => {
    if (!selectedProfessional || !appointmentTime) {
      toast.error('Por favor, selecione um profissional e insira o horário.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          professionalId: selectedProfessional.id,
          appointmentTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao agendar consulta');
      }

      toast.success('Agendamento criado com sucesso!');
      closeModal();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <button
        onClick={openModal}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Selecionar profissional
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Lista de Profissionais</h2>
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ) : (
              <table className="table-auto w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Nome</th>
                    <th className="border px-4 py-2">Especialidade</th>
                    <th className="border px-4 py-2">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(professionals) && professionals.length > 0 ? (
                    professionals.map((professional) => (
                      <tr key={professional.id}>
                        <td className="border px-4 py-2">{professional.name}</td>
                        <td className="border px-4 py-2">{professional.specialty}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => handleSelectProfessional(professional)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                          >
                            Selecionar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="border px-4 py-2 text-center">
                        Nenhum profissional encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            <button
              onClick={closeModal}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition mt-4"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {selectedProfessional && (
        <div className="mt-4 bg-white p-4 rounded shadow-md w-full max-w-lg">
          <h3 className="text-lg font-semibold">Agendar com: {selectedProfessional.name}</h3>
          <p>Especialidade: {selectedProfessional.specialty}</p>
          <input
            type="datetime-local"
            value={appointmentTime}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="border rounded p-2 w-full mt-2"
          />
          <button
            onClick={handleScheduleAppointment}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-2"
          >
            Agendar Consulta
          </button>
        </div>
      )}
    </div>
  );
}
