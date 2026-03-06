import { BaseApiClient } from "@/lib/api";
import type { UpdateUserCredentials } from "@/types/auth";
import type { OrderDetails, OrderFormData, OrderList } from "@/types/order";

class OrderService extends BaseApiClient {
  async getById(orderId: string): Promise<OrderDetails> {
    return this.get<OrderDetails>(`order/${orderId}/`);
  }

  async create(data: OrderFormData): Promise<OrderDetails> {
    return this.post<OrderDetails>(`order/add`, data);
  }

  async update(orderId: string, data: UpdateUserCredentials): Promise<OrderDetails> {
    return this.patch<OrderDetails>(`order/update/${orderId}/`, data);
  }

  async list(params?: { page?: number; limit?: number; search?: string, category?: string }): Promise<OrderList> {
    return this.get<OrderList>('order/', params);
  }

  async deleteById(orderId: string): Promise<void> {
    return this.delete<void>(`order/delete/${orderId}/`);
  }
}

export const orderService = new OrderService();