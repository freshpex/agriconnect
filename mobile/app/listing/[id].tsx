import { useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useListing } from "../../src/hooks/useListings";
import { useCreateOrder } from "../../src/hooks/useOrders";
import { useAuth } from "../../src/hooks/useAuth";
import { KeyboardAwareScrollView } from "../../src/components/layout/KeyboardAwareScrollView";
import { Loading, Button, Badge, Input } from "../../src/components/ui";
import {
  formatCurrency,
  formatDate,
  timeAgo,
  CROP_CATEGORIES,
  getErrorMessage,
} from "../../src/utils/helpers";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading } = useListing(id);
  const { user } = useAuth();
  const createOrder = useCreateOrder();
  const router = useRouter();

  const [quantity, setQuantity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showOrder, setShowOrder] = useState(false);

  if (isLoading || !listing) return <Loading />;

  const category = CROP_CATEGORIES.find((c) => c.value === listing.category);
  const isOwn = listing.farmer?._id === user?.id;
  const coordinates = listing.coordinates?.coordinates;
  const hasCoordinates = Array.isArray(coordinates) && coordinates.length === 2;
  const latitude = hasCoordinates ? coordinates![1] : undefined;
  const longitude = hasCoordinates ? coordinates![0] : undefined;

  function openMap() {
    if (latitude === undefined || longitude === undefined) return;
    const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`;
    Linking.openURL(url);
  }

  async function handleOrder() {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      Alert.alert("Error", "Enter a valid quantity");
      return;
    }
    if (qty > listing!.quantity) {
      Alert.alert("Error", "Quantity exceeds available stock");
      return;
    }

    try {
      await createOrder.mutateAsync({
        listingId: listing!._id,
        quantity: qty,
        deliveryAddress: deliveryAddress || undefined,
      });
      Alert.alert("Order Placed!", "The seller will be notified.", [
        { text: "View Orders", onPress: () => router.push("/(tabs)/orders") },
      ]);
    } catch (err: unknown) {
      Alert.alert("Error", getErrorMessage(err));
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: listing.cropName,
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAwareScrollView className="bg-white" extraBottom={32}>
        {/* Hero */}
        <View className="bg-primary-50 px-6 py-8 items-center">
          <Text className="text-6xl mb-3">{category?.emoji || "📦"}</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {listing.cropName}
          </Text>
          <Text className="text-lg text-gray-500 mt-1">
            {category?.label.replace(/^.+\s/, "")}
          </Text>
        </View>

        <View className="px-6 py-5">
          {/* Price */}
          <View className="flex-row items-end justify-between mb-5">
            <View>
              <Text className="text-sm text-gray-500">Price per unit</Text>
              <Text className="text-3xl font-bold text-primary-700">
                {formatCurrency(listing.pricePerUnit, listing.currency)}
                <Text className="text-lg text-gray-400 font-normal">
                  /{listing.unit}
                </Text>
              </Text>
            </View>
            <Badge
              label={`${listing.quantity} ${listing.unit} left`}
              color={listing.quantity > 10 ? "green" : "yellow"}
            />
          </View>

          {/* Description */}
          {listing.description ? (
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-500 mb-1">
                Description
              </Text>
              <Text className="text-base text-gray-700">
                {listing.description}
              </Text>
            </View>
          ) : null}

          {/* Details */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-5">
            <DetailRow
              label="Category"
              value={category?.label || listing.category}
            />
            <DetailRow
              label="Available"
              value={`${listing.quantity} ${listing.unit}`}
            />
            {typeof listing.trustScore === "number" && (
              <DetailRow
                label="Trust Score"
                value={`${listing.trustScore}/100 (${listing.trustDecision || "pending"})`}
              />
            )}
            {listing.harvestDate && (
              <DetailRow
                label="Harvest Date"
                value={formatDate(listing.harvestDate)}
              />
            )}
            {listing.farmAddress && (
              <DetailRow label="Location" value={listing.farmAddress} />
            )}
            <DetailRow label="Listed" value={timeAgo(listing.createdAt)} />
            <DetailRow label="Views" value={`${listing.views}`} />
          </View>

          {hasCoordinates &&
          latitude !== undefined &&
          longitude !== undefined ? (
            <View className="mb-5">
              <Button
                title="View on OpenStreetMap"
                variant="outline"
                onPress={openMap}
              />
            </View>
          ) : null}

          {/* Seller Info */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-5">
            <Text className="text-base font-bold text-gray-900 mb-2">
              Seller
            </Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base text-gray-800">
                  {listing.farmer?.name}
                </Text>
                <View className="flex-row gap-2 mt-1">
                  {listing.farmer?.kycVerified && (
                    <Badge label="KYC Verified" color="green" />
                  )}
                  {listing.farmer?.locationVerified && (
                    <Badge label="Location Verified" color="blue" />
                  )}
                </View>
              </View>
              {listing.farmer?.rating > 0 && (
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text className="text-base font-semibold ml-1">
                    {listing.farmer.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Order Section */}
          {!isOwn && listing.active && listing.quantity > 0 && (
            <View>
              {showOrder ? (
                <View className="bg-primary-50 rounded-2xl p-4 mb-5">
                  <Text className="text-lg font-bold text-gray-900 mb-3">
                    Place Order
                  </Text>
                  <Input
                    label={`Quantity (${listing.unit})`}
                    placeholder={`Max ${listing.quantity}`}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                  <Input
                    label="Delivery Address (optional)"
                    placeholder="Where should it be delivered?"
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                  />
                  {quantity ? (
                    <Text className="text-lg font-bold text-primary-700 mb-3 text-center">
                      Total:{" "}
                      {formatCurrency(
                        parseFloat(quantity || "0") * listing.pricePerUnit,
                        listing.currency
                      )}
                    </Text>
                  ) : null}
                  <Button
                    title="Confirm Order"
                    onPress={handleOrder}
                    loading={createOrder.isPending}
                  />
                  <TouchableOpacity
                    onPress={() => setShowOrder(false)}
                    className="items-center mt-3"
                  >
                    <Text className="text-gray-500">Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Button
                  title="Buy Now"
                  onPress={() => setShowOrder(true)}
                  icon={<Ionicons name="cart-outline" size={20} color="#fff" />}
                />
              )}
            </View>
          )}

          <View className="mt-6">
            <Button
              title="Report Issue"
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: "/report-issue",
                  params: { targetType: "listing", targetId: listing._id },
                })
              }
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-800">{value}</Text>
    </View>
  );
}
