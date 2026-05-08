'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Scissors, Clock, Loader2, AlertCircle, User } from 'lucide-react';
import { fetcher } from '@/lib/api';
import { ServiceDto, BarberDto } from '@barberos/types';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
      toast.success('Servicio creado con éxito');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-white/10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Servicios</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Administra el catálogo de servicios por barbero</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all text-xs uppercase tracking-widest shadow-xl shadow-white/5"
        >
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      {services?.length === 0 ? (
        <div className="bg-[#111] border border-white/5 p-20 rounded-[3rem] text-center shadow-2xl backdrop-blur-sm">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
            <Scissors className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Sin servicios</h3>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-10">Añade servicios a tus barberos para comenzar</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black font-black px-10 py-4 rounded-2xl hover:bg-gray-200 transition-all text-xs uppercase tracking-widest"
          >
            Crear Primer Servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services?.map((service) => (
            <div key={service.id} className="bg-[#111] border border-white/5 p-10 rounded-[2.5rem] hover:border-white/10 transition-all group relative overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="flex justify-between items-start mb-10">
                <div className="p-4 bg-white/5 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  <Scissors className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/20 block mb-1 uppercase font-black tracking-widest">Inversión</span>
                  <span className="text-2xl font-black text-white">${service.price}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{service.name}</h3>
              <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">
                <User className="w-3 h-3" />
                <span>PROFESIONAL: {(service as any).barber?.name}</span>
              </div>
              
              <div className="flex items-center gap-3 text-amber-500/60 font-black text-xs uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                <span>{service.durationMinutes} MINUTOS</span>
              </div>

              <div className="mt-10">
                <button className="w-full text-[10px] font-black py-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl transition-all border border-white/5 uppercase tracking-widest">
                  Editar Servicio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Crear Servicio"
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Barbero Responsable</label>
            <select 
              required
              value={formData.barberId}
              onChange={(e) => setFormData({...formData, barberId: e.target.value})}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold text-sm"
            >
              <option value="" className="bg-[#111]">SELECCIONA UN BARBERO...</option>
              {barbers?.map(b => (
                <option key={b.id} value={b.id} className="bg-[#111]">{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Nombre del Servicio</label>
            <input 
              required
              type="text" 
              placeholder="EJ: CORTE DEGRADADO"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Precio ($)</label>
              <input 
                required
                type="number" 
                placeholder="12000"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold text-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Duración (min)</label>
              <input 
                required
                type="number" 
                placeholder="30"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({...formData, durationMinutes: Number(e.target.value)})}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold text-sm"
              />
            </div>
          </div>

          {createMutation.isError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
              <AlertCircle className="w-4 h-4" />
              {(createMutation.error as Error).message}
            </div>
          )}

          <button 
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest mt-6"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Servicio'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
