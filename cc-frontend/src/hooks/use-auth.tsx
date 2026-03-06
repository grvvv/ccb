import { authService } from '@/lib/auth'
import { authService as apiAuthService } from '@/services/auth.service'
import type { LoginCredentials, RegisterCredentials } from '@/types/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const user = await apiAuthService.getMe()
      return user
    },
    enabled: authService.isAuth(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiAuthService.login(credentials),

    onSuccess: (data) => {
      // Single atomic auth write
      authService.setAuth(data.authToken, data.user)

      queryClient.setQueryData(['user'], data.user)

      // Role-based landing (optional improvement)
      if (data.user.role === 'admin') {
        router.navigate({ to: '/admin' })
      } else {
        router.navigate({ to: '/' })
      }
    },
  })

  const registerMutation = useMutation({
    mutationFn: (formData: RegisterCredentials) =>
      apiAuthService.register(formData),

    onSuccess: () => {
      router.navigate({ to: '/login' })
    },
  })

  const logout = () => {
    authService.logout()
    queryClient.removeQueries({ queryKey: ['user'] })
    router.navigate({ to: '/login' })
  }

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated: authService.isAuth(),
    isLoading,
    error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
  }
}
