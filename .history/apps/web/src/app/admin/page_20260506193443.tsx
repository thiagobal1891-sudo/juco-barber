'use client';

import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Scissors
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import { BarberDto, ServiceDto, BookingDto } from '@barberos/types';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: barbers } = useQuery<BarberDto[]>({ queryKey: ['barbers'], queryFn: () => fetcher('/barbers') });
  const { data: services } = useQuery<ServiceDto[]>({ queryKey: ['services'], queryFn: () => fetcher('/services') });
  const { data: bookings } = useQuery<BookingDto[]>({ queryKey: ['admin-bookings'], queryFn: () => fetcher('/admin/appointments') });


  const stats = [
    { label: 'Barberos', value: barbers?.length || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Servicios', value: services?.length || 0, icon: Scissors, color: 'bg-purple-500' },
    { label: 'Total Reservas', value: bookings?.length || 0, icon: Calendar, color: 'bg-amber-500' },
    { label: 'Próximos Turnos', value: bookings?.filter(b => new Date(b.startTime) > new Date()).length || 0, icon: Clock, color: 'bg-amber-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Panel de Vaon</h1>
        <p className="text-gray-400">Resumen general de tu barbería.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 text-white group-hover:bg-opacity-100 group-hover:text-black transition-all`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Últimas Reservas</h2>
            <Link href="/admin/agenda" className="text-sm text-gray-500 hover:text-white transition-colors">Ver agenda</Link>
          </div>
          
          <div className="space-y-4">
            {bookings?.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold">
                    {booking.clientName[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{booking.clientName}</h4>
                    <p className="text-xs text-gray-500">{booking.service?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hs</p>
                  <p className="text-xs text-gray-500">{new Date(booking.startTime).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {(!bookings || bookings.length === 0) && (
              <p className="text-center py-8 text-gray-600 italic">No hay reservas aún</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-amber-500 rounded-3xl p-8 text-black shadow-xl shadow-amber-500/20">
            <h2 className="text-2xl font-bold mb-2 text-black">Crecimiento</h2>
            <p className="opacity-60 mb-6 font-medium">Gestiona tu equipo y servicios para atraer más clientes.</p>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/barbers" className="bg-black text-white p-4 rounded-2xl font-bold flex flex-col gap-2 hover:bg-black/80 transition-all">
                <Users className="w-5 h-5"/>
                Nuevo Barbero
              </Link>
              <Link href="/admin/services" className="bg-black/10 text-black p-4 rounded-2xl font-bold flex flex-col gap-2 hover:bg-black/20 transition-all border border-black/10">
                <Scissors className="w-5 h-5"/>
                Nuevo Servicio
              </Link>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Visión del Cliente</h2>
            <p className="opacity-40 mb-6 font-medium">Ver cómo ven los clientes tu página de reservas.</p>
            <Link href="/" target="_blank" className="bg-amber-500 text-black px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10">
              Ver Landing <ChevronRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
