import { BaseApiClient } from "@/lib/api";
import type { UpdateUserCredentials } from "@/types/auth";
import type { CategoryDetails, CategoryList, CreateCategoryFormDetails } from "@/types/category";

class CategoryService extends BaseApiClient {
  async getById(id: string): Promise<CategoryDetails> {
    return this.get<CategoryDetails>(`product/${id}/`);
  }

  async create(data: CreateCategoryFormDetails): Promise<CategoryDetails> {
    return this.post<CategoryDetails>(`category/add`, data);
  }

  async update(id: string, data: UpdateUserCredentials): Promise<CategoryDetails> {
    return this.patch<CategoryDetails>(`category/update/${id}/`, data);
  }

  async list(params?: { page?: number; limit?: number; search?: string, category?: string }): Promise<CategoryList> {
    return this.get<CategoryList>('category/featured/', params);
  }

  async deleteById(id: string): Promise<void> {
    return this.delete<void>(`category/delete/${id}/`);
  }
}

export const categoryService = new CategoryService();