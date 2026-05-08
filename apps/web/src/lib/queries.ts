import { useQuery } from '@tanstack/react-query';
import { ServiceDto, BarberDto, SlotDto } from '@barberos/types';
import { fetcher } from './api';

export const useServices = (slug: string) => {
  return useQuery({
    queryKey: ['services', slug],
    queryFn: () => fetcher<ServiceDto[]>('/services', slug),
    enabled: !!slug,
  });
};

export const useBarbers = (slug: string) => {
  return useQuery({
    queryKey: ['barbers', slug],
    queryFn: () => fetcher<BarberDto[]>('/barbers', slug),
    enabled: !!slug,
  });
};

export const useAvailabilitySlots = (slug: string, barberId: string, date: string) => {
  return useQuery({
    queryKey: ['availability', slug, barberId, date],
    queryFn: () => fetcher<SlotDto[]>(`/barbers/${barberId}/availability/slots?date=${date}`, slug),
    enabled: !!slug && !!barberId && !!date,
  });
};
