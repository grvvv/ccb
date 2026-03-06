import type { User } from '@/types/auth'
import { redirect } from '@tanstack/react-router'

type Role = 'general' | 'admin'

export class AuthService {
  private static instance: AuthService
  private user: User | null = null

  private constructor() {
    this.hydrate()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private hydrate() {
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      this.user = JSON.parse(storedUser)
    }
  }

  isAuth(): boolean {
    return !!localStorage.getItem('auth_token')
  }

  getUser(): User | null {
    return this.user
  }

  getRole(): Role | null {
    return this.user?.role ?? null
  }

  setAuth(token: string, user: User) {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
    this.user = user
  }

  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    this.user = null
  }

  // Guards

  requireAuth() {
    if (!this.isAuth()) {
      throw redirect({ to: '/login' })
    }
  }

  requireGuest() {
    if (this.isAuth()) {
      throw redirect({ to: '/' })
    }
  }

  requireAdmin() {
    if (!this.isAuth()) {
      throw redirect({ to: '/login' })
    }

    if (this.getRole() !== 'admin') {
      throw redirect({ to: '/' })
    }
  }
}

export const authService = AuthService.getInstance()
