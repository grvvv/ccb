import { authService } from '@/lib/auth'
import { authService as apiAuthService } from '@/services/auth.service'
import type { LoginCredentials, RegisterCredentials } from '@/types/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const {data: user, isLoading, error} = useQuery({
    queryKey: ['user'],
    queryFn: () => apiAuthService.getMe(),
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

  const logout = useCallback(() => {
    authService.logout()
    queryClient.removeQueries({ queryKey: ['user'] })
    router.navigate({ to: '/login' })
  }, [queryClient, router])

  return useMemo(() => ({
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,   // ✅ derive from query data, not localStorage
    isLoading,
    error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
  }), [user, isLoading, error, loginMutation, registerMutation, logout])
}
