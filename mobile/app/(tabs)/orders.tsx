import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useMyOrders } from "../../src/hooks/useOrders";
import { OrderCard } from "../../src/components/orders/OrderCard";
import { Loading, EmptyState } from "../../src/components/ui";

export default function OrdersScreen() {
  const { user } = useAuth();
  const [viewAs, setViewAs] = useState<"buyer" | "seller">(
    user?.role === "farmer" ? "seller" : "buyer"
  );

  const { data: orders, isLoading } = useMyOrders({ role: viewAs });

  if (isLoading) return <Loading />;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tab selector */}
      <View className="flex-row mx-4 mt-3 mb-2 bg-gray-100 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setViewAs("buyer")}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            viewAs === "buyer" ? "bg-white shadow-sm" : ""
          }`}
        >
          <Text
            className={`font-semibold ${
              viewAs === "buyer" ? "text-primary-700" : "text-gray-500"
            }`}
          >
            My Purchases
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewAs("seller")}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            viewAs === "seller" ? "bg-white shadow-sm" : ""
          }`}
        >
          <Text
            className={`font-semibold ${
              viewAs === "seller" ? "text-primary-700" : "text-gray-500"
            }`}
          >
            My Sales
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <OrderCard order={item} viewAs={viewAs} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="No Orders"
            message={
              viewAs === "buyer"
                ? "Orders you place will appear here"
                : "Orders from buyers will appear here"
            }
          />
        }
      />
    </View>
  );
}
