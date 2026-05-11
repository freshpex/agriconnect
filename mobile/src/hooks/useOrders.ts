import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders";
import { useAuth } from "./useAuth";
import { createOrderWithOfflineQueue } from "../utils/offlineQueue";
import type { Order } from "../types";

export function useMyOrders(params?: {
  role?: "buyer" | "seller";
  status?: string;
}) {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["orders", userId, params],
    queryFn: () => ordersApi.getMyOrders(params).then((r) => r.data.orders),
    enabled: !!userId,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getOne(id).then((r) => r.data.order),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrderWithOfflineQueue,
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({
        queryKey: ["listing", variables.listingId],
      });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (response, variables) => {
      const updatedOrder = response.data.order;

      queryClient.setQueryData<Order>(
        ["order", variables.id],
        (currentOrder) =>
          currentOrder
            ? {
                ...currentOrder,
                ...updatedOrder,
              }
            : updatedOrder
      );
      queryClient.setQueriesData<Order[]>(
        { queryKey: ["orders"] },
        (currentOrders) =>
          currentOrders?.map((order) =>
            order._id === variables.id ? { ...order, ...updatedOrder } : order
          )
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
}
