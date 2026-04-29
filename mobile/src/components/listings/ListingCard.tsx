import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import type { Listing } from "../../types";
import { formatCurrency, timeAgo, CROP_CATEGORIES } from "../../utils/helpers";
import { Badge } from "../ui/Badge";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();

  const categoryInfo = CROP_CATEGORIES.find(
    (c) => c.value === listing.category
  );

  return (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${listing._id}`)}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg">{categoryInfo?.emoji || "📦"}</Text>
            <Text className="text-lg font-bold text-gray-900">
              {listing.cropName}
            </Text>
          </View>

          <Text className="text-sm text-gray-500 mb-2">
            by {listing.farmer?.name || "Unknown"}
            {listing.farmer?.kycVerified ? " ✅" : ""}
          </Text>

          <View className="flex-row items-center gap-3 mb-2">
            <Text className="text-primary-700 font-bold text-lg">
              {formatCurrency(listing.pricePerUnit, listing.currency)}
              <Text className="text-sm font-normal text-gray-500">
                /{listing.unit}
              </Text>
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Badge
              label={`${listing.quantity} ${listing.unit} available`}
              color="green"
            />
            {listing.locationVerified && (
              <Badge label="📍 Verified" color="blue" />
            )}
          </View>
        </View>

        <View className="items-end">
          <Text className="text-xs text-gray-400">
            {timeAgo(listing.createdAt)}
          </Text>
          {listing.farmAddress ? (
            <Text
              className="text-xs text-gray-400 mt-1 max-w-[100px] text-right"
              numberOfLines={1}
            >
              📍 {listing.farmAddress}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
