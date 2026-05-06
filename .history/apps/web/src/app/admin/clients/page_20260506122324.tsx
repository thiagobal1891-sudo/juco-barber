'use client';

import { Plus, Search, User, Mail, Phone, Calendar } from 'lucide-react';

export default function ClientsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
          <p className="text-gray-400">Base de datos de tus clientes y su historial.</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all">
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email o teléfono..." 
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Último Turno</th>
              <th className="px-6 py-4">Total Visitas</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[1, 2, 3, 4].map((i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold">C</div>
                    <div>
                      <div className="font-bold text-white">Nombre Cliente {i}</div>
                      <div className="text-xs text-gray-500 text-ellipsis overflow-hidden max-w-[150px]">ID: {Math.random().toString(36).substr(2, 9)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Mail className="w-3 h-3 text-gray-500" /> cliente{i}@example.com
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Phone className="w-3 h-3 text-gray-500" /> +54 9 11 5555-{i}000
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" /> 12 May 2026
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-white">{i * 3}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors">Ver Ficha</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
