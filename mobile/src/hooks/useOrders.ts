import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders";

export function useMyOrders(params?: {
  role?: "buyer" | "seller";
  status?: string;
}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApi.getMyOrders(params).then((r) => r.data.orders),
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
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
