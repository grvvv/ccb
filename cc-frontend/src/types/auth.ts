export interface User {
  id: string;
  company: string,
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'general';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export interface UpdateUserCredentials {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'general';
  company: string;
}

export interface AuthResponse {
  user: User;
  authToken: string;
}