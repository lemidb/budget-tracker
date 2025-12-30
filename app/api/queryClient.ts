import { QueryClient } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable refetching on window focus
      refetchOnWindowFocus: false,
      // Retry failed requests once by default
      retry: 1,
      // Cache time of 5 minutes
      gcTime: 5 * 60 * 1000,
      // Stale time of 30 seconds
      staleTime: 30 * 1000,
    },
  },
});

export default queryClient;
