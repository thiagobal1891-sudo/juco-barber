'use client';

import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  CreditCard, 
  Shield, 
  Globe, 
  Clock,
  Save,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import { toast } from 'sonner';

type WorkingHour = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Perfil');
  const queryClient = useQueryClient();

  const { data: workingHours, isLoading } = useQuery<WorkingHour[]>({
    queryKey: ['working-hours'],
    queryFn: () => fetcher('/admin/working-hours'),
  });

  const updateWHMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<WorkingHour> }) => 
      fetcher(`/admin/working-hours/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] });
      toast.success('Horario actualizado');
    },
  });

  const handleToggleDay = (wh: WorkingHour) => {
    updateWHMutation.mutate({ id: wh.id, data: { isActive: !wh.isActive } });
  };

  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: string) => {
    updateWHMutation.mutate({ id, data: { [field]: value } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-gray-400">Personaliza tu barbería y horarios de atención.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-2">
          {[
            { label: 'Perfil', icon: SettingsIcon },
            { label: 'Horarios', icon: Clock },
            { label: 'Notificaciones', icon: Bell },
            { label: 'Seguridad', icon: Shield },
          ].map((item) => (
            <button 
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.label ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </aside>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'Perfil' && (
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-8">Perfil de la Barbería</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Comercial</label>
                    <input type="text" defaultValue="Vaon Studio" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Teléfono</label>
                    <input type="text" placeholder="+54 11 1234-5678" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/20 transition-all" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Descripción / Bio</label>
                  <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/20 transition-all" defaultValue="Especialistas en cortes premium y estilismo masculino." />
                </div>

                <div className="flex justify-end pt-4">
                  <button className="bg-white text-black font-bold px-10 py-4 rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5 flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Horarios' && (
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-2">Horarios de Atención</h2>
              <p className="text-gray-500 text-sm mb-8">Define cuándo está abierta tu barbería para recibir turnos.</p>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-white/20" />
                  </div>
                ) : (
                  workingHours?.map((wh) => (
                    <div 
                      key={wh.id} 
                      className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border transition-all ${
                        wh.isActive ? 'bg-white/5 border-white/10' : 'bg-black border-white/5 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <button 
                          onClick={() => handleToggleDay(wh)}
                          className={`w-12 h-6 rounded-full relative transition-all ${wh.isActive ? 'bg-green-500' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${wh.isActive ? 'right-1' : 'left-1'}`} />
                        </button>
                        <span className="font-bold text-white w-24 capitalize">{days[wh.dayOfWeek]}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <input 
                            type="time" 
                            value={wh.startTime} 
                            disabled={!wh.isActive}
                            onChange={(e) => handleTimeChange(wh.id, 'startTime', e.target.value)}
                            className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                          />
                        </div>
                        <span className="text-gray-600">a</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={wh.endTime} 
                            disabled={!wh.isActive}
                            onChange={(e) => handleTimeChange(wh.id, 'endTime', e.target.value)}
                            className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

