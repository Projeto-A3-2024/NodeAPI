"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Appointment {
  id: number
  appointmentTime: Date;
  status: string
  user: Customer
}

interface Customer {
    id: number
    username: string
    email: string
}

export default function Appointments() {
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  useAuth('PROFESSIONAL');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/appointments/professionals', {
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

  const handleSelectAppointment = async (appointment: Appointment) => {
    setAppointmentTime(appointment.appointmentTime.toString());
    setAppointmentId(appointment.id);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <div className="mt-4 bg-white p-4 rounded shadow-md w-full max-w-lg">
		<table className="table-auto w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border px-4 py-2">Data</th>
              <th className="border px-4 py-2">Horários Disponíveis</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Nome do Paciente</th>
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
                      {appointment.user != null ? appointment.user.username : ''}
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
      </div>
    </div>
  );
}
