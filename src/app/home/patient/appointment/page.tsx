"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Professional {
  id: number;
  name: string;
  specialty: string;
}

interface Appointment {
  id: number
  appointmentTime: Date;
}

export default function ProfessionalList() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const router = useRouter();
  useAuth('PATIENT');

  useEffect(() => {
    fetchProfessionals();
  }, []);

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

  const handleSelectProfessional = async (professional: Professional) => {
    setSelectedProfessional(professional);
    await fetchProfessionalAppointments(professional.id);
  };

  const handleScheduleAppointment = async (appointmentId: number) => {
    if (!selectedProfessional || !appointmentTime) {
      toast.error('Por favor, selecione um profissional e insira o horário.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao agendar consulta');
      }

      toast.success('Agendamento criado com sucesso!');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      router.push("/home/patient");
    }
  };

  const fetchProfessionalAppointments = async (professionalId: number) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/appointments/only-available?professionalId=${professionalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        toast.error('Erro ao buscar horários');
        return null;
      }
      const data = await response.json();
      setAppointments(data.appointments);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAppointment = async (appointment: Appointment) => {
    setAppointmentTime(appointment.appointmentTime.toString());
    setAppointmentId(appointment.id);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      {!selectedProfessional && (
        (
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
            </div>
          </div>
        )
      )}

      {selectedProfessional && (
        <div className="mt-4 bg-white p-4 rounded shadow-md w-full max-w-lg">
          <h3 className="text-lg font-semibold">Agendar com: {selectedProfessional.name}</h3>
          <p>Especialidade: {selectedProfessional.specialty}</p>

          <table className="table-auto w-full border-collapse mt-4">
            <thead>
              <tr>
                <th className="border px-4 py-2">Data</th>
                <th className="border px-4 py-2">Horários Disponíveis</th>
                <th className="border px-4 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => {
                  const isSelected = appointment.appointmentTime.toString() === appointmentTime;
                  return (
                    <tr
                      key={appointment.id}
                      className={isSelected ? "bg-blue-100" : ""}
                    >
                      <td className="border px-4 py-2">
                        {new Date(appointment.appointmentTime).toLocaleDateString()}
                      </td>
                      <td className="border px-4 py-2">
                        {new Date(appointment.appointmentTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleSelectAppointment(appointment)}
                          className={`${isSelected ? "bg-blue-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                            } px-2 py-1 rounded transition`}
                        >
                          {isSelected ? "Selecionado" : "Selecionar"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="border px-4 py-2 text-center">
                    Nenhum horário disponível.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            onClick={() => handleScheduleAppointment(appointmentId!)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-2"
            disabled={!appointmentTime}
          >
            Agendar Consulta
          </button>
        </div>
      )}
    </div>
  );
}
