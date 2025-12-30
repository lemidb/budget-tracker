// lib/mutations/auth/register.ts
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import  apiClient  from '@/lib/client';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  token: string;
}

export const useRegister = () => {
  const router = useRouter();

  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data) => {
      const response = await apiClient.post<RegisterResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }
      
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    },
    onError: (error: any) => {
      // Handle specific error messages if needed
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  });
};