import { api } from "./client";
import type { Order, OrderStatus, PaginatedOrders } from "../types";

export const ordersApi = {
  create(data: {
    listingId: string;
    quantity: number;
    deliveryAddress?: string;
    notes?: string;
  }) {
    return api.post<{ order: Order }>("/orders", data);
  },
  getMine(params?: {
    role?: "buyer" | "seller";
    status?: OrderStatus | "";
    page?: number;
    limit?: number;
  }) {
    return api.get<PaginatedOrders>("/orders", { params });
  },
  getOne(id: string) {
    return api.get<{ order: Order }>(`/orders/${id}`);
  },
  updateStatus(id: string, status: OrderStatus) {
    return api.patch<{ order: Order }>(`/orders/${id}/status`, { status });
  },
};
