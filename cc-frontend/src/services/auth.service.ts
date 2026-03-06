import { BaseApiClient } from "@/lib/api";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types/auth";

class AuthService extends BaseApiClient {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/sign-in/', credentials);
  }

  async register(formData: RegisterCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/sign-up/', formData);
  }

  async getMe(): Promise<User> {
    return this.get<User>('/user/me/');
  }

  // async logout(): Promise<void> {
  //   return this.post<void>('/auth/logout');
  // }

  // async refreshToken(): Promise<AuthResponse> {
  //   return this.post<AuthResponse>('/auth/refresh');
  // }
}

export const authService = new AuthService();
