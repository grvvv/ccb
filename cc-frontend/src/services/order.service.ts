import { BaseApiClient } from "@/lib/api";
import type { UpdateUserCredentials } from "@/types/auth";
import type { CreateOrderResponse, OrderDetailsResponse, OrderFormData, OrderList } from "@/types/order";

class OrderService extends BaseApiClient {
  async getById(orderId: string): Promise<OrderDetailsResponse> {
    return this.get<OrderDetailsResponse>(`order/${orderId}/`);
  }

  async create(data: OrderFormData): Promise<CreateOrderResponse> {
    return this.post<CreateOrderResponse>(`order/add`, data);
  }

  async update(orderId: string, data: UpdateUserCredentials): Promise<OrderDetailsResponse> {
    return this.patch<OrderDetailsResponse>(`order/update/${orderId}/`, data);
  }

  async myOrders(params?: { page?: number; limit?: number; search?: string, category?: string }): Promise<OrderList> {
    return this.get<OrderList>('order/me/', params);
  }

  async list(params?: { page?: number; limit?: number; search?: string, category?: string }): Promise<OrderList> {
    return this.get<OrderList>('order/', params);
  }

  async deleteById(orderId: string): Promise<void> {
    return this.delete<void>(`order/delete/${orderId}/`);
  }

  async deleteUnpaidOrder(orderId: string): Promise<void> {
    return this.delete<void>(`order/unpaid/${orderId}/`);
  }
}

export const orderService = new OrderService();