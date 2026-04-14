import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useOrder, useUpdateOrderStatus } from "../../src/hooks/useOrders";
import { useAuth } from "../../src/hooks/useAuth";
import { Loading, Button } from "../../src/components/ui";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
  getErrorMessage,
} from "../../src/utils/helpers";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { user } = useAuth();
  const updateStatus = useUpdateOrderStatus();

  if (isLoading || !order) return <Loading />;

  const isSeller = order.seller._id === user?.id;
  const isBuyer = order.buyer._id === user?.id;
  const statusInfo = ORDER_STATUS_LABELS[order.status];

  function handleStatusUpdate(newStatus: string, label: string) {
    Alert.alert(
      `${label}?`,
      `Are you sure you want to ${label.toLowerCase()} this order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: label,
          onPress: async () => {
            try {
              await updateStatus.mutateAsync({
                id: order!._id,
                status: newStatus,
              });
              Alert.alert("Success", `Order ${label.toLowerCase()}d`);
            } catch (err: unknown) {
              Alert.alert("Error", getErrorMessage(err));
            }
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Order Details",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView className="flex-1 bg-gray-50 px-4 pt-4">
        {/* Status */}
        <View className="bg-white rounded-2xl p-5 mb-4 items-center border border-gray-100">
          <View
            className="rounded-full px-5 py-2 mb-2"
            style={{ backgroundColor: (statusInfo?.color || "#999") + "20" }}
          >
            <Text
              className="text-lg font-bold"
              style={{ color: statusInfo?.color }}
            >
              {statusInfo?.label}
            </Text>
          </View>
          <Text className="text-gray-500 text-sm">
            Order placed {formatDate(order.createdAt)}
          </Text>
        </View>

        {/* Product Info */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            {order.listing?.cropName || "Product"}
          </Text>
          <DetailRow
            label="Quantity"
            value={`${order.quantity} ${order.unit}`}
          />
          <DetailRow
            label="Price per unit"
            value={formatCurrency(
              order.listing?.pricePerUnit || order.totalPrice / order.quantity,
              order.currency
            )}
          />
          <DetailRow
            label="Total"
            value={formatCurrency(order.totalPrice, order.currency)}
            bold
          />
        </View>

        {/* Parties */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-base font-bold text-gray-900 mb-2">Seller</Text>
          <Text className="text-gray-700">{order.seller.name}</Text>
          <Text className="text-gray-500 text-sm">{order.seller.phone}</Text>

          <Text className="text-base font-bold text-gray-900 mt-4 mb-2">
            Buyer
          </Text>
          <Text className="text-gray-700">{order.buyer.name}</Text>
          <Text className="text-gray-500 text-sm">{order.buyer.phone}</Text>
        </View>

        {/* Delivery */}
        {order.deliveryAddress ? (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="text-base font-bold text-gray-900 mb-1">
              Delivery Address
            </Text>
            <Text className="text-gray-700">{order.deliveryAddress}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View className="mb-8 gap-3">
          {isSeller && order.status === "pending" && (
            <Button
              title="Confirm Order"
              onPress={() => handleStatusUpdate("confirmed", "Confirm")}
              loading={updateStatus.isPending}
            />
          )}
          {isSeller && order.status === "confirmed" && (
            <Button
              title="Mark as In Transit"
              onPress={() => handleStatusUpdate("in-transit", "Dispatch")}
              variant="secondary"
              loading={updateStatus.isPending}
            />
          )}
          {isBuyer && order.status === "in-transit" && (
            <Button
              title="Confirm Delivery"
              onPress={() =>
                handleStatusUpdate("delivered", "Confirm delivery")
              }
              loading={updateStatus.isPending}
            />
          )}
          {(isSeller || isBuyer) &&
            ["pending", "confirmed"].includes(order.status) && (
              <Button
                title="Cancel Order"
                onPress={() => handleStatusUpdate("cancelled", "Cancel")}
                variant="danger"
                loading={updateStatus.isPending}
              />
            )}
        </View>
      </ScrollView>
    </>
  );
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-50">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text
        className={`text-sm ${bold ? "font-bold text-primary-700" : "font-medium text-gray-800"}`}
      >
        {value}
      </Text>
    </View>
  );
}
