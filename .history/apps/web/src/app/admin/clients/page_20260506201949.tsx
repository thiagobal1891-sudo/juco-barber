'use client';

import { Plus, Search, User, Mail, Phone, Calendar } from 'lucide-react';

export default function ClientsPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Clientes</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Base de datos y gestión de clientes</p>
        </div>
        
        <button className="flex items-center justify-center gap-3 bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all text-xs uppercase tracking-widest shadow-xl shadow-white/5">
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="p-8 border-b border-white/5 flex items-center gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input 
              type="text" 
              placeholder="BUSCAR POR NOMBRE, EMAIL O TELÉFONO..." 
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-bold placeholder:text-white/10"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-white/20 text-[10px] uppercase tracking-[0.3em] font-black">
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Contacto</th>
                <th className="px-8 py-6">Último Turno</th>
                <th className="px-8 py-6">Visitas</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center font-black text-amber-500 text-lg">
                        C{i}
                      </div>
                      <div>
                        <div className="font-black text-white text-lg uppercase tracking-tight">Cliente de Prueba {i}</div>
                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">ID: VAON-CL-2026-00{i}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs font-bold text-white/60">
                        <Mail className="w-4 h-4 text-white/20" /> cliente{i}@vaonstudio.com
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-white/60">
                        <Phone className="w-4 h-4 text-white/20" /> +54 9 11 5555-{i}000
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 text-sm font-bold text-white/60">
                      <Calendar className="w-4 h-4 text-white/20" /> {12 + i} May 2026
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-sm font-black text-white">
                      {i * 2 + 1}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-[10px] font-black text-amber-500 uppercase tracking-widest border-b border-amber-500/0 hover:border-amber-500 transition-all pb-1">Ver Ficha</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
