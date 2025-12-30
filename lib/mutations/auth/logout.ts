// lib/mutations/auth/logout.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/client';

const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      // Clear auth query cache
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      
      // Clear any user data from localStorage if needed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }

      // Redirect to login page
      router.push('/auth/login');
      router.refresh();
    },
  });
};

export default useLogout;

