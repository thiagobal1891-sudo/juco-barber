'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  User,
  Scissors,
  Loader2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  CalendarDays,
  Ban
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { fetcher } from '@/lib/api';
import { BookingDto } from '@barberos/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';


dayjs.locale('es');

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockData, setBlockData] = useState({ startTime: '09:00', endTime: '10:00', reason: '' });
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery<BookingDto[]>({
    queryKey: ['admin-bookings'],
    queryFn: () => fetcher('/admin/appointments'),
  });

  const blockMutation = useMutation({
    mutationFn: (data: any) => 
      fetcher('/admin/block-time', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setIsBlocking(false);
      toast.success('Horario bloqueado');
    },
  });

  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = selectedDate.set('hour', parseInt(blockData.startTime.split(':')[0])).set('minute', parseInt(blockData.startTime.split(':')[1])).toISOString();
    const end = selectedDate.set('hour', parseInt(blockData.endTime.split(':')[0])).set('minute', parseInt(blockData.endTime.split(':')[1])).toISOString();
    
    blockMutation.mutate({
      startTime: start,
      endTime: end,
      reason: blockData.reason
    });
  };


  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      fetcher(`/admin/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Estado actualizado');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => 
      fetcher(`/admin/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.error('Reserva cancelada');
    },
  });

  const dayBookings = bookings?.filter(b => 
    dayjs(b.startTime).isSame(selectedDate, 'day')
  ) || [];

  const handleStatusUpdate = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
  };

  const statusColors: any = {
    reserved: 'bg-amber-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  const statusLabels: any = {
    reserved: 'Reservado',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Agenda</h1>
          <p className="text-gray-400">Gestiona los turnos de Vaon.</p>
        </div>
        <button 
          onClick={() => setIsBlocking(true)}
          className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
        >
          <Ban className="w-5 h-5" />
          Bloquear Horario
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-[#111] p-2 rounded-2xl border border-white/5 w-fit">

        <button 
          onClick={() => setSelectedDate(selectedDate.subtract(1, 'day'))}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="px-4 text-center min-w-[200px]">
          <h3 className="font-bold text-white capitalize">
            {selectedDate.format('dddd, D [de] MMMM')}
          </h3>
        </div>
        <button 
          onClick={() => setSelectedDate(selectedDate.add(1, 'day'))}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden relative min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-1 divide-y divide-white/5">
          {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((time) => {
            const slotBookings = dayBookings.filter(b => 
              dayjs(b.startTime).format('HH:00') === time
            );

            return (
              <div key={time} className="flex min-h-[100px] group">
                <div className="w-20 p-4 text-right border-r border-white/5">
                  <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">
                    {time}
                  </span>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3">
                  {slotBookings.map((booking: any) => (
                    <div key={booking.id} className="bg-[#1a1a1a] border border-white/5 p-5 rounded-[2rem] flex items-center justify-between shadow-2xl transition-all hover:border-white/10">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                          {booking.clientName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-white text-lg">{booking.clientName}</h4>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[booking.status || 'reserved']} text-black`}>
                              {statusLabels[booking.status || 'reserved']}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                              <Scissors className="w-3.5 h-3.5" /> {booking.service?.name}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                              <Clock className="w-3.5 h-3.5" /> {dayjs(booking.startTime).format('HH:mm')}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                              <User className="w-3.5 h-3.5" /> {booking.barber?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {booking.status === 'reserved' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-black transition-all"
                              title="Marcar como completado"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-black transition-all"
                              title="Cancelar turno"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {slotBookings.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-700 text-xs italic">
                      Disponible
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Bloquear Horario */}
      <AnimatePresence>
        {isBlocking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Ban className="w-6 h-6 text-red-500" />
                  Bloquear Horario
                </h2>
                <button onClick={() => setIsBlocking(false)} className="text-gray-500 hover:text-white transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleBlockSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Inicio</label>
                    <input 
                      type="time" 
                      value={blockData.startTime}
                      onChange={(e) => setBlockData({...blockData, startTime: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Fin</label>
                    <input 
                      type="time" 
                      value={blockData.endTime}
                      onChange={(e) => setBlockData({...blockData, endTime: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Motivo (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Almuerzo, Descanso..."
                    value={blockData.reason}
                    onChange={(e) => setBlockData({...blockData, reason: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={blockMutation.isPending}
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {blockMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Bloqueo'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


