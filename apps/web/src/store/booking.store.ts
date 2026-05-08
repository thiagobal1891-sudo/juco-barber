import { create } from 'zustand';
import { BarberDto, ServiceDto, SlotDto } from '@barberos/types';

interface BookingState {
  step: number;
  service: ServiceDto | null;
  barber: BarberDto | null;
  selectedDate: Date;
  slot: SlotDto | null;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setService: (service: ServiceDto) => void;
  setBarber: (barber: BarberDto) => void;
  setDate: (date: Date) => void;
  setSlot: (slot: SlotDto) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  service: null,
  barber: null,
  selectedDate: new Date(),
  slot: null,

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  
  setService: (service) => set({ service, step: 2 }),
  setBarber: (barber) => set({ barber, step: 3, slot: null }),
  setDate: (date) => set({ selectedDate: date, slot: null }),
  setSlot: (slot) => set({ slot, step: 4 }),
  
  reset: () => set({
    step: 1,
    service: null,
    barber: null,
    selectedDate: new Date(),
    slot: null,
  }),
}));
