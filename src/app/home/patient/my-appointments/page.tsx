"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Appointment {
  id: number
  appointmentTime: Date;
  status: string
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  useAuth('PATIENT');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/appointments/users', {
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
    }
  }

  const cancelAppointment = async (appointmentId: number) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/appointments/users/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        toast.error('Erro ao cancelar horário');
        return null;
      }

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      fetchAppointments();
    }
  }

  const handleCancelClick = (appointmentId: number) => {
    setAppointmentToCancel(appointmentId);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (appointmentToCancel !== null) {
      cancelAppointment(appointmentToCancel);
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAppointmentToCancel(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <div className="mt-4 bg-white p-4 rounded shadow-md w-full max-w-lg">

        <table className="table-auto w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border px-4 py-2">Data</th>
              <th className="border px-4 py-2">Horários</th>
              <th className="border px-4 py-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => {
                return (
                  <tr
                    key={appointment.id}
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
                        onClick={() => handleCancelClick(appointment.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-2"
                      >
                        Cancelar Consulta
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold">Tem certeza que deseja cancelar?</h3>
              <p className="mt-2">Este processo não pode ser desfeito.</p>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={handleConfirmCancel}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Sim, Cancelar
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
    </div>
  );
}
