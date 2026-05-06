'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Scissors, Clock, Loader2, AlertCircle, User } from 'lucide-react';
import { fetcher } from '@/lib/api';
import { ServiceDto, BarberDto } from '@barberos/types';
import { Modal } from '@/components/ui/Modal';

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    barberId: '',
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
  });

  const { data: services, isLoading } = useQuery<ServiceDto[]>({
    queryKey: ['services'],
    queryFn: () => fetcher('/services'),
  });

  const { data: barbers } = useQuery<BarberDto[]>({
    queryKey: ['barbers'],
    queryFn: () => fetcher('/barbers'),
  });

  const createMutation = useMutation({
    mutationFn: (newService: typeof formData) => 
      fetcher('/services', {
        method: 'POST',
        body: JSON.stringify(newService),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsModalOpen(false);
      setFormData({ barberId: '', name: '', description: '', durationMinutes: 30, price: 0 });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Servicios</h1>
          <p className="text-gray-400">Administra el menú de servicios por cada barbero.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      {services?.length === 0 ? (
        <div className="bg-[#111] border border-white/5 p-12 rounded-2xl text-center">
          <Scissors className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No hay servicios</h3>
          <p className="text-gray-500 mb-6">Añade servicios a tus barberos para que puedan recibir reservas.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-all"
          >
            Crear Servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <div key={service.id} className="bg-[#111] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/5 rounded-xl text-white group-hover:bg-white group-hover:text-black transition-all">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block mb-1 uppercase font-bold tracking-widest">Precio</span>
                  <span className="text-xl font-bold text-white">${service.price}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <User className="w-3 h-3" />
                <span>Barbero: {(service as any).barber?.name}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>{service.durationMinutes} minutos</span>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 text-xs font-bold py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/5">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Crear Nuevo Servicio"
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Barbero Responsable</label>
            <select 
              required
              value={formData.barberId}
              onChange={(e) => setFormData({...formData, barberId: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            >
              <option value="">Selecciona un barbero...</option>
              {barbers?.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre del Servicio</label>
            <input 
              required
              type="text" 
              placeholder="Ej: Corte Degradado"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Precio ($)</label>
              <input 
                required
                type="number" 
                placeholder="12000"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Duración (min)</label>
              <input 
                required
                type="number" 
                placeholder="30"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({...formData, durationMinutes: Number(e.target.value)})}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {createMutation.isError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {(createMutation.error as Error).message}
            </div>
          )}

          <button 
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Servicio'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
