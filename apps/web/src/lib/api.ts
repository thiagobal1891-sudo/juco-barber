import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

import { useAuthStore } from '@/store/auth.store';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = useAuthStore.getState().token;
  
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });


  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }

  const json = await res.json();
  // Always unwrap data if it exists from the backend interceptor
  return json && typeof json === 'object' && 'data' in json ? json.data : json;
};
