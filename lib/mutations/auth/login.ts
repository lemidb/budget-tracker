import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/client';

interface LoginData {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface LoginResponse {
  user: UserData;
  token: string;
}

const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Token is now stored in an HTTP-only cookie by the server.
      // Invalidate and refetch auth query to update AuthContext
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      // Redirect to dashboard after successful login
      router.push('/dashboard');
      router.refresh(); // Refresh to update auth state
    },
    onError: (error: any) => {
      // Handle specific error messages if needed
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  });
};

export default useLogin; 