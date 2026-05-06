'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { fetcher } from '@/lib/api';
import { BarberDto, ServiceDto, SlotDto } from '@barberos/types';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { cn } from '@/lib/utils';

dayjs.locale('es');

// Iconos
const ArrowRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const ArrowLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const X = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

type Step = 'idle' | 'service' | 'date' | 'confirm' | 'success';

export default function VaonSPA() {
  const [step, setStep] = useState<Step>('idle');
  const [selectedBarber, setSelectedBarber] = useState<BarberDto | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceDto | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', email: '' });

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Obtención de datos
  const { data: barbers } = useQuery<BarberDto[]>({
    queryKey: ['barbers'],
    queryFn: () => fetcher('/barbers'),
  });

  useEffect(() => {
    if (barbers && barbers.length > 0) {
      setSelectedBarber(barbers[0]);
    }
  }, [barbers]);

  const { data: availability, isLoading: loadingSlots } = useQuery<SlotDto[]>({
    queryKey: ['availability', selectedBarber?.id, selectedDate.format('YYYY-MM-DD'), selectedService?.id],
    queryFn: () => fetcher(`/bookings/availability?barberId=${selectedBarber?.id}&date=${selectedDate.format('YYYY-MM-DD')}&serviceId=${selectedService?.id}`),
    enabled: !!selectedBarber && !!selectedService && step === 'date',
  });

  const bookingMutation = useMutation({
    mutationFn: (data: any) => fetcher('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => setStep('success'),
  });

  const handleBooking = () => {
    if (!selectedBarber || !selectedService || !selectedSlot) return;
    const [hours, minutes] = selectedSlot.split(':');
    const startTime = selectedDate.set('hour', parseInt(hours)).set('minute', parseInt(minutes)).toISOString();

    bookingMutation.mutate({
      barberId: selectedBarber.id,
      serviceId: selectedService.id,
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone,
      clientEmail: clientInfo.email,
      startTime,
    });
  };

  const resetBooking = () => {
    setStep('idle');
    setSelectedService(null);
    setSelectedSlot(null);
    setClientInfo({ name: '', phone: '', email: '' });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#050505] overflow-x-hidden">
      {/* Glow effects background */}
      <div className="absolute top-0 left-0 w-full h-[120vh] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Navbar Premium */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-8 flex justify-between items-center mix-blend-difference">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={resetBooking}
        >
          <span className="text-2xl font-black tracking-tighter uppercase leading-none">Vaon</span>
          <div className="h-[1px] w-8 bg-white/40" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Est. 2024</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-12"
        >
          <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            <a href="#experiencia" className="hover:opacity-40 transition">Experiencia</a>
            <a href="#servicios" className="hover:opacity-40 transition">Servicios</a>
            <a href="#ubicacion" className="hover:opacity-40 transition">Ubicación</a>
          </div>
          <button 
            onClick={() => setStep('service')}
            className="px-8 py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
          >
            Reservar Ahora
          </button>
        </motion.div>
      </nav>

      {/* Sección Hero */}
      <section className="relative h-screen w-full flex flex-col justify-center px-6 md:px-12 pt-20">
        <motion.div style={{ opacity, scale }} className="z-10">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.5em] mb-6 text-white/40"
          >
            Artesanía Tradicional
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-[12vw] md:text-[10vw] font-black tracking-tighter leading-[0.85] uppercase mb-12"
          >
            Eleva tu <br />
            <span className="text-gradient">Personalidad</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col md:flex-row items-end gap-8"
          >
            <button 
              onClick={() => setStep('service')}
              className="group flex items-center gap-6 text-xl font-bold uppercase tracking-tight"
            >
              Comienza el viaje 
              <div className="w-12 h-12 rounded-full border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all shadow-lg group-hover:shadow-amber-500/20">
                <ArrowRight />
              </div>
            </button>
            <p className="max-w-xs text-xs font-medium text-white/40 leading-relaxed uppercase tracking-wider">
              Vaon es más que una barbería. Es un santuario donde la precisión se encuentra con el alma.
            </p>
          </motion.div>
        </motion.div>

        {/* Imagen de fondo Hero */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-60 pointer-events-none hidden lg:block overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1503951458645-643d53efd90f?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover scale-110 motion-safe:animate-[pulse_10s_infinite]"
            alt="Barbería Vaon"
          />
        </div>
      </section>

      {/* Sección Experiencia (Storytelling) */}
      <section id="experiencia" className="py-40 px-6 md:px-12 bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20">La Visión</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                Más allá del <br /> Corte Ordinario
              </h2>
              <p className="text-xl text-white/60 leading-relaxed font-light">
                En Vaon, creemos que cada hombre tiene una historia que contar. Nuestra misión es ayudarte a contar la tuya a través de un estilo meticulosamente diseñado que resuene con tu identidad.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-12 border-t border-white/5">
                <div>
                  <h4 className="text-3xl font-black mb-2">12+</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Años de Experiencia</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black mb-2">5k</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Clientes Felices</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden group">
              <img 
                src="/images/detalle_corte.png" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s] brightness-110"
                alt="Detalle de corte"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <p className="text-xs font-medium italic text-amber-200/60">"La calidad no es un acto, es un hábito."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Galería de Estilos */}
      <section className="py-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 aspect-video rounded-[2rem] overflow-hidden brightness-90 hover:brightness-110 transition-all duration-700 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Ambiente" />
          </div>
          <div className="aspect-square rounded-[2rem] overflow-hidden brightness-90 hover:brightness-110 transition-all duration-700 shadow-2xl">
            <img src="/images/corte_1.png" className="w-full h-full object-cover" alt="Corte 1" />
          </div>
          <div className="aspect-square rounded-[2rem] overflow-hidden brightness-90 hover:brightness-110 transition-all duration-700 shadow-2xl">
            <img src="/images/corte_2.png" className="w-full h-full object-cover" alt="Corte 2" />
          </div>
        </div>
      </section>

      {/* Sección Servicios Seleccionados */}
      <section id="servicios" className="py-40 px-6 md:px-12 bg-[#080808]">
        <div className="max-w-7xl mx-auto text-center mb-32">
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20">Curaduría</span>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mt-4">Servicios</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { name: 'Corte de Precisión', price: '45', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80' },
            { name: 'Escultura de Barba', price: '30', img: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80' },
            { name: 'El Ritual Vaon', price: '70', img: 'https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?auto=format&fit=crop&q=80' }
          ].map((s, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl"
              onClick={() => setStep('service')}
            >
              <img src={s.img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={s.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">{s.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Desde ${s.price}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all shadow-lg">
                  <ArrowRight />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Wizard de Reservas (Overlay) */}
      <AnimatePresence>
        {step !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-[#111] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh] shadow-2xl"
            >
              {/* Sidebar de Información */}
              <div className="w-full md:w-1/3 bg-white/5 p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5">
                <div>
                  <button onClick={resetBooking} className="mb-12 opacity-40 hover:opacity-100 transition">
                    <X />
                  </button>
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Tu <br /> Cita</h3>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Vaon Studio</p>
                </div>

                <div className="space-y-6">
                  {selectedService && (
                    <div className="animate-in fade-in slide-in-from-left-4">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Servicio</p>
                      <p className="text-sm font-bold uppercase">{selectedService.name}</p>
                    </div>
                  )}
                  {selectedSlot && (
                    <div className="animate-in fade-in slide-in-from-left-4">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Horario</p>
                      <p className="text-sm font-bold uppercase">{selectedDate.format('D [de] MMM')}, {selectedSlot} HS</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido del Wizard */}
              <div className="flex-1 p-8 md:p-16 overflow-y-auto no-scrollbar bg-black/40">
                <AnimatePresence mode="wait">
                  {/* Paso 1: Elegir Servicio */}
                  {step === 'service' && (
                    <motion.div 
                      key="service"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Elige <br /> Servicio</h2>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedBarber?.services?.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => {
                              setSelectedService(service);
                              setStep('date');
                            }}
                            className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group"
                          >
                            <div className="text-left">
                              <h4 className="text-lg font-bold uppercase group-hover:text-amber-500 transition-colors">{service.name}</h4>
                              <p className="text-[10px] opacity-40 group-hover:opacity-60">{service.durationMinutes} MINUTOS</p>
                            </div>
                            <span className="text-xl font-black text-amber-500">${service.price}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Paso 2: Elegir Fecha y Hora */}
                  {step === 'date' && (
                    <motion.div 
                      key="date"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-12"
                    >
                      <button onClick={() => setStep('service')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition">
                        <ArrowLeft /> Volver
                      </button>
                      <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Elige un <br /> Momento</h2>
                      
                      <div className="space-y-8">
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                          {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                            const date = dayjs().add(offset, 'day');
                            const active = date.isSame(selectedDate, 'day');
                            return (
                              <button
                                key={offset}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                  "flex-shrink-0 w-20 py-6 rounded-2xl flex flex-col items-center gap-1 transition-all",
                                  active ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-white/5 text-white/40 hover:bg-white/10"
                                )}
                              >
                                <span className="text-[8px] font-bold uppercase tracking-widest">{date.format('ddd')}</span>
                                <span className="text-2xl font-black">{date.format('D')}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {loadingSlots ? (
                            <div className="col-span-full py-12 flex justify-center opacity-20">Cargando...</div>
                          ) : (
                            availability?.map((slot) => (
                              <button
                                key={slot.time}
                                disabled={!slot.available}
                                onClick={() => {
                                  setSelectedSlot(slot.time);
                                  setStep('confirm');
                                }}
                                className={cn(
                                  "py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                  slot.available 
                                    ? "bg-white/[0.05] hover:bg-amber-500 hover:text-black shadow-lg hover:shadow-amber-500/20" 
                                    : "opacity-10 cursor-not-allowed line-through"
                                )}
                              >
                                {slot.time}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Paso 3: Confirmación */}
                  {step === 'confirm' && (
                    <motion.div 
                      key="confirm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-12"
                    >
                      <button onClick={() => setStep('date')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition">
                        <ArrowLeft /> Volver
                      </button>
                      <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Tus <br /> Datos</h2>
                      
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          placeholder="NOMBRE COMPLETO"
                          value={clientInfo.name}
                          onChange={(e) => setClientInfo({...clientInfo, name: e.target.value.toUpperCase()})}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm font-bold focus:outline-none focus:bg-white/10 transition-all uppercase tracking-widest"
                        />
                        <input 
                          type="text" 
                          placeholder="WHATSAPP"
                          value={clientInfo.phone}
                          onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm font-bold focus:outline-none focus:bg-white/10 transition-all tracking-widest"
                        />
                        <input 
                          type="email" 
                          placeholder="EMAIL"
                          value={clientInfo.email}
                          onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm font-bold focus:outline-none focus:bg-white/10 transition-all tracking-widest uppercase"
                        />
                        
                        <button 
                          onClick={handleBooking}
                          disabled={!clientInfo.name || !clientInfo.phone || bookingMutation.isPending}
                          className="w-full bg-amber-500 text-black font-black py-6 rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-tighter disabled:opacity-50 mt-8 shadow-xl shadow-amber-500/20"
                        >
                          {bookingMutation.isPending ? 'PROCESANDO...' : 'CONFIRMAR RESERVA'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Paso 4: Éxito */}
                  {step === 'success' && (
                    <motion.div 
                      key="success"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-8"
                    >
                      <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/40">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Confirmado</h2>
                        <p className="text-white/40 text-sm font-medium">Nos vemos pronto en Vaon Studio. <br /> Se ha enviado una confirmación a tu email.</p>
                      </div>
                      <button 
                        onClick={resetBooking}
                        className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-white pb-2 hover:opacity-40 transition"
                      >
                        Volver al Inicio
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sección Ubicación */}
      <section id="ubicacion" className="py-40 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-end gap-20">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">Ubicación</h2>
            <div className="space-y-2">
              <p className="text-2xl font-bold uppercase tracking-tight">Calle Falsa 123</p>
              <p className="text-white/40 uppercase font-bold tracking-widest text-xs">Buenos Aires, Argentina</p>
            </div>
            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">Horarios de Atención</p>
              <p className="text-sm font-bold uppercase">Lun — Sáb: 09:00 — 20:00</p>
            </div>
          </div>
          <div className="w-full lg:w-1/2 aspect-video rounded-[3rem] overflow-hidden border border-amber-500/10 group shadow-2xl">
            <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="Mapa" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 opacity-20 hover:opacity-100 transition-opacity">
          <div className="text-2xl font-black tracking-tighter uppercase">Vaon</div>
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em]">
            <a href="#" className="hover:underline">Instagram</a>
            <a href="#" className="hover:underline">Facebook</a>
            <a href="#" className="hover:underline">WhatsApp</a>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em]">© 2024 Vaon Studio</div>
        </div>
      </footer>
    </div>
  );
}
