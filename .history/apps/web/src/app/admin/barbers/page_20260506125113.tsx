'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, User, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { fetcher } from '@/lib/api';
import { BarberDto } from '@barberos/types';
import { Modal } from '@/components/ui/Modal';

export default function BarbersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });

  const { data: barbers, isLoading, error } = useQuery<BarberDto[]>({
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
      setFormData({ name: '', bio: '' });
    },
  });

  const filteredBarbers = barbers?.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-white mb-2">Barberos</h1>
          <p className="text-gray-400">Gestiona tu equipo de profesionales para Vaon.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Nuevo Barbero
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>

        {filteredBarbers?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No se encontraron barberos.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Barbero</th>
                <th className="px-6 py-4">Servicios</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBarbers?.map((barber) => (
                <tr key={barber.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-white uppercase">
                        {barber.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white">{barber.name}</div>
                        <div className="text-xs text-gray-500">{barber.bio || 'Sin biografía'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {barber.services?.length || 0} asociados
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                      barber.isActive 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {barber.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Añadir Nuevo Barbero"
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre</label>
            <input 
              required
              type="text" 
              placeholder="Ej: Juan Pérez"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Biografía (opcional)</label>
            <textarea 
              placeholder="Especialista en degradados..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            />
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
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Barbero'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
