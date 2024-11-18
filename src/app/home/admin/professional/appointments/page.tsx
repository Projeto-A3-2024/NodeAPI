"use client";
import { useAuth } from "@/hooks/useAuth";
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
  status: string
}

export default function ProfessionalList() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  useAuth('ADMIN');

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

  const fetchProfessionalAppointments = async (professionalId: number) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/appointments/professionals/${professionalId}`, {
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

  const handleScheduleAppointment = async (professionalId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/professionals/${professionalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao agendar consulta');
      }

      toast.success('Agendamento criado com sucesso!');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      fetchProfessionalAppointments(professionalId);
    }
  };

  const deleteAppointment = async (appointmentId: number, professionalId: number) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        toast.error('Erro ao excluir horário');
        return null;
      }

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      fetchProfessionalAppointments(professionalId);
    }
  }

  const handleCancelClick = (appointmentId: number) => {
    setAppointmentToCancel(appointmentId);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = (professionalId: number) => {
    if (appointmentToCancel !== null) {
      deleteAppointment(appointmentToCancel, professionalId);
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAppointmentToCancel(null);
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
          <h3 className="text-lg font-semibold">{selectedProfessional.name}</h3>
          <p>Especialidade: {selectedProfessional.specialty}</p>

          <input
            type="datetime-local"
            value={appointmentTime}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="border rounded p-2 w-full mt-2"
          />
          <button
            onClick={() => handleScheduleAppointment(selectedProfessional.id)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-2"
          >
            Agendar Disponbilidade
          </button>

          <table className="table-auto w-full border-collapse mt-4">
            <thead>
              <tr>
                <th className="border px-4 py-2">Data</th>
                <th className="border px-4 py-2">Horário</th>
                <th className="border px-4 py-2">Status</th>
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
                        <div className="flex items-center justify-center">
                          <span
                            className={`inline-block w-4 h-4 rounded-full ${appointment.status === 'INDISPONIVEL' ? 'bg-red-500' : 'bg-green-500'
                              }`}
                          />
                          <span className="ml-2">
                            {appointment.status === 'INDISPONIVEL' ? 'Agendado' : 'Livre'}
                          </span>
                        </div>
                      </td>

                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleCancelClick(appointment.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-2"
                        >
                          Excluir
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
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold">Tem certeza que deseja excluir?</h3>
            <p className="mt-2">Este processo não pode ser desfeito.</p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => handleConfirmCancel(selectedProfessional!.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sim, Excluir
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-500"
              >
                Não, Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
