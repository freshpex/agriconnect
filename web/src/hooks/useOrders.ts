import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders";
import type { OrderStatus } from "../types";

export function useOrders(params?: {
  role?: "buyer" | "seller";
  status?: OrderStatus | "";
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApi.getMine(params).then((response) => response.data),
  });
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () =>
      ordersApi.getOne(id!).then((response) => response.data.order),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      listingId: string;
      quantity: number;
      deliveryAddress?: string;
      notes?: string;
    }) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
}
