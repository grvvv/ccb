import { BaseApiClient } from "@/lib/api";
import type { RegisterCredentials, UpdateUserCredentials } from "@/types/auth";
import type { UserListResponse, UserProfile } from "@/types/user";

class UserService extends BaseApiClient {
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.get<UserProfile>(`user/${userId}/`);
  }

  async getMyProfile(): Promise<UserProfile> {
    return this.get<UserProfile>(`user/me`);
  }

  async addAddress(data: object): Promise<UserProfile> {
    return this.patch<UserProfile>(`user/add-address`, data);
  }

  async deleteAddress(addressId: string): Promise<null> {
    return this.delete<null>(`user/remove-address/${addressId}`);
  }

  async createProfile(data: RegisterCredentials): Promise<UserProfile> {
    return this.post<UserProfile>(`register/`, data);
  }

  async updateProfile(userId: string, data: UpdateUserCredentials): Promise<UserProfile> {
    return this.patch<UserProfile>(`user/update/${userId}/`, data);
  }

  async getUsersList(params?: { page?: number; limit?: number; search?: string }): Promise<UserListResponse> {
    return this.get<UserListResponse>('user/', params);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete<void>(`user/delete/${userId}/`);
  }
}

export const userService = new UserService();