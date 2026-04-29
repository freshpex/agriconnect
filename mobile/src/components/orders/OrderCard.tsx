import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import type { Order } from "../../types";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
} from "../../utils/helpers";

interface OrderCardProps {
  order: Order;
  viewAs: "buyer" | "seller";
}

export function OrderCard({ order, viewAs }: OrderCardProps) {
  const router = useRouter();
  const statusInfo = ORDER_STATUS_LABELS[order.status];
  const counterparty = viewAs === "buyer" ? order.seller : order.buyer;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/order/${order._id}`)}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">
            {order.listing?.cropName || "Order"}
          </Text>
          <Text className="text-sm text-gray-500">
            {viewAs === "buyer" ? "From" : "To"}: {counterparty?.name}
          </Text>
        </View>

        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: statusInfo?.color + "20" }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: statusInfo?.color }}
          >
            {statusInfo?.label}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-gray-600">
          {order.quantity} {order.unit}
        </Text>
        <Text className="text-base font-bold text-primary-700">
          {formatCurrency(order.totalPrice, order.currency)}
        </Text>
      </View>

      <Text className="text-xs text-gray-400 mt-2">
        {formatDate(order.createdAt)}
      </Text>
    </TouchableOpacity>
  );
}
