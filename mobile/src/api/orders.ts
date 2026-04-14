import api from "./client";
import type { Order } from "../types";

export const ordersApi = {
  create(data: {
    listingId: string;
    quantity: number;
    deliveryAddress?: string;
    notes?: string;
  }) {
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
