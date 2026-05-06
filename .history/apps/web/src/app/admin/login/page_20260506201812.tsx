'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { fetcher } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await fetcher<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuth(data.access_token, data.user);
      router.push('/admin');

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-3xl mb-8 shadow-2xl backdrop-blur-xl">
            <Scissors className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Vaon Studio</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">Panel Administrativo</p>
        </div>

        <div className="bg-[#111] border border-white/5 p-10 rounded-[3rem] shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Credenciales</label>
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-5 rounded-2xl focus:outline-none focus:border-amber-500/50 transition-all font-bold text-sm placeholder:text-white/10"
                  placeholder="EMAIL"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-5 rounded-2xl focus:outline-none focus:border-amber-500/50 transition-all font-bold text-sm placeholder:text-white/10"
                  placeholder="CONTRASEÑA"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 text-black font-black py-6 rounded-2xl hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/10"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Acceder al Panel'
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-12 text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
          &copy; 2026 Vaon Studio. Artesanía en cada corte.
        </p>
      </div>
    </div>
  );
}
