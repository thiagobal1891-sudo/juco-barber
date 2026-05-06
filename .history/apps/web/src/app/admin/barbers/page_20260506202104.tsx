'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import { fetcher } from '@/lib/api';
import { BarberDto } from '@barberos/types';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BarbersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', avatarUrl: '' });

  const { data: barbers, isLoading } = useQuery<BarberDto[]>({
    queryKey: ['barbers'],
    queryFn: () => fetcher('/barbers'),
  });

  const createMutation = useMutation({
    mutationFn: (newBarber: typeof formData) => 
      fetcher('/barbers', {
        method: 'POST',
        body: JSON.stringify(newBarber),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      setIsModalOpen(false);
      setFormData({ name: '', bio: '', avatarUrl: '' });
      toast.success('Barbero creado con éxito');
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
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Barberos</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Administra tu equipo de profesionales</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all text-xs uppercase tracking-widest shadow-xl shadow-white/5"
        >
          <Plus className="w-5 h-5" />
          Añadir Barbero
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {barbers?.map((barber) => (
          <div key={barber.id} className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 hover:border-white/10 transition-all group relative overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                {barber.avatarUrl ? (
                  <img src={barber.avatarUrl} alt={barber.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl uppercase">
                    {barber.name[0]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{barber.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Activo</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm font-bold text-white/60 mb-8 line-clamp-2 min-h-[2.5rem]">
              {barber.bio || "Profesional especializado en cortes clásicos y modernos."}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
              <div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Servicios</span>
                <span className="text-lg font-black text-white">{barber.services?.length || 0}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Turnos</span>
                <span className="text-lg font-black text-white">42</span>
              </div>
            </div>

            <div className="mt-8">
              <button className="w-full text-[10px] font-black py-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl transition-all border border-white/5 uppercase tracking-widest">
                Editar Profesional
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nuevo Profesional"
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Nombre Completo</label>
            <input 
              required
              type="text" 
              placeholder="EJ: JUAN PÉREZ"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold text-sm"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Biografía</label>
            <textarea 
              placeholder="DESCRIPCIÓN DEL PROFESIONAL..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={3}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold text-sm resize-none"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">URL Avatar (Opcional)</label>
            <input 
              type="text" 
              placeholder="HTTPS://..."
              value={formData.avatarUrl}
              onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest mt-6"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Profesional'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
