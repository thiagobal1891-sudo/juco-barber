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
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Configuración</h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Personaliza tu barbería y horarios de atención</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-3">
          {[
            { label: 'Perfil', icon: SettingsIcon },
            { label: 'Horarios', icon: Clock },
            { label: 'Notificaciones', icon: Bell },
            { label: 'Seguridad', icon: Shield },
          ].map((item) => (
            <button 
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all",
                activeTab === item.label 
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </aside>

        <div className="lg:col-span-3">
          {activeTab === 'Perfil' && (
            <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-white mb-10 uppercase tracking-tighter">Perfil de la Barbería</h2>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Nombre Comercial</label>
                    <input 
                      type="text" 
                      defaultValue="Vaon Studio" 
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Teléfono Público</label>
                    <input 
                      type="text" 
                      placeholder="+54 11 1234-5678" 
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold" 
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Descripción / Bio</label>
                  <textarea 
                    rows={4} 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold resize-none" 
                    defaultValue="Especialistas en cortes premium y estilismo masculino. Experiencia única en Buenos Aires." 
                  />
                </div>

                <div className="flex justify-end pt-6">
                  <button className="bg-white text-black font-black px-12 py-5 rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5 flex items-center gap-3 text-xs uppercase tracking-widest">
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Horarios' && (
            <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Horarios de Atención</h2>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-10">Define tus franjas horarias de disponibilidad</p>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-white/10" />
                  </div>
                ) : (
                  workingHours?.map((wh) => (
                    <div 
                      key={wh.id} 
                      className={cn(
                        "flex flex-col md:flex-row md:items-center justify-between p-8 rounded-3xl border transition-all duration-300",
                        wh.isActive 
                          ? "bg-white/[0.03] border-white/10" 
                          : "bg-black border-white/5 opacity-40"
                      )}
                    >
                      <div className="flex items-center gap-6 mb-6 md:mb-0">
                        <button 
                          onClick={() => handleToggleDay(wh)}
                          className={cn(
                            "w-14 h-8 rounded-full relative transition-all duration-300",
                            wh.isActive ? "bg-green-500 shadow-lg shadow-green-500/20" : "bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                            wh.isActive ? "right-1.5" : "left-1.5"
                          )} />
                        </button>
                        <span className="text-lg font-black text-white w-28 uppercase tracking-tighter">{days[wh.dayOfWeek]}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <input 
                            type="time" 
                            value={wh.startTime} 
                            disabled={!wh.isActive}
                            onChange={(e) => handleTimeChange(wh.id, 'startTime', e.target.value)}
                            className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all disabled:opacity-30"
                          />
                        </div>
                        <span className="text-white/10 font-bold uppercase text-[10px] tracking-widest">a</span>
                        <div className="flex items-center gap-3">
                          <input 
                            type="time" 
                            value={wh.endTime} 
                            disabled={!wh.isActive}
                            onChange={(e) => handleTimeChange(wh.id, 'endTime', e.target.value)}
                            className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all disabled:opacity-30"
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

