import api from "./client";
import type { Order } from "../types";

export interface CreateOrderInput {
  listingId: string;
  quantity: number;
  deliveryAddress?: string;
  notes?: string;
  clientRequestId?: string;
}

export const ordersApi = {
  create(data: CreateOrderInput) {
    return api.post<{ order: Order }>("/orders", data);
  },

  getMyOrders(params?: { role?: "buyer" | "seller"; status?: string }) {
    return api.get<{ orders: Order[] }>("/orders", { params });
  },

  getOne(id: string) {
    return api.get<{ order: Order }>(`/orders/${id}`);
  },

  updateStatus(id: string, status: string) {
    return api.patch<{ order: Order }>(`/orders/${id}/status`, { status });
  },
};
