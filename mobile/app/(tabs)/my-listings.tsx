import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMyListings, useDeleteListing } from "../../src/hooks/useListings";
import { useAuth } from "../../src/hooks/useAuth";
import { FarmerAccessRequired } from "../../src/components/FarmerAccessRequired";
import { Loading, EmptyState, Badge } from "../../src/components/ui";
import {
  getOfflineQueue,
  subscribeOfflineQueue,
  type OfflineAction,
} from "../../src/utils/offlineQueue";
import { formatCurrency, CROP_CATEGORIES } from "../../src/utils/helpers";
import type { Listing } from "../../src/types";

type ListingWithSyncState = Listing & { pendingSync?: boolean };

export default function MyListingsScreen() {
  const { user } = useAuth();
  const isFarmer = user?.role === "farmer";
  const { data: listings, isLoading } = useMyListings(isFarmer);
  const deleteMutation = useDeleteListing();
  const router = useRouter();
  const [queuedActions, setQueuedActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadQueue() {
      const queue = await getOfflineQueue();
      if (!mounted) return;
      setQueuedActions(queue);
    }

    loadQueue();
    const unsubscribe = subscribeOfflineQueue((queue) => {
      if (mounted) setQueuedActions(queue);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const pendingListings = useMemo<ListingWithSyncState[]>(() => {
    if (!user?.id) return [];

    const listingActions = queuedActions.filter(
      (action): action is Extract<OfflineAction, { type: "create-listing" }> =>
        action.type === "create-listing" && action.userId === user.id
    );

    return listingActions.map((action) => {
      const latitude = action.payload.latitude;
      const longitude = action.payload.longitude;
      const hasCoordinates =
        typeof latitude === "number" && typeof longitude === "number";

      return {
        _id: `pending-${action.id}`,
        farmer: {
          _id: user.id,
          name: user.name,
          phone: user.phone,
          rating: user.rating,
          kycVerified: user.kycVerified,
          locationVerified: user.locationVerified,
          farmAddress: action.payload.farmAddress || user.farmAddress,
        },
        cropName: action.payload.cropName,
        category: action.payload.category || "other",
        quantity: action.payload.quantity,
        unit: action.payload.unit,
        pricePerUnit: action.payload.pricePerUnit,
        currency: action.payload.currency || "NGN",
        description: action.payload.description,
        images: [],
        locationVerified: Boolean(user.locationVerified),
        coordinates: hasCoordinates
          ? {
              type: "Point",
              coordinates: [longitude, latitude] as [number, number],
            }
          : undefined,
        farmAddress: action.payload.farmAddress,
        harvestDate: action.payload.harvestDate,
        trustScore: undefined,
        trustDecision: undefined,
        reviewStatus: "pending",
        clientRequestId: action.payload.clientRequestId,
        active: false,
        views: 0,
        createdAt: action.createdAt,
        updatedAt: action.createdAt,
        pendingSync: true,
      };
    });
  }, [queuedActions, user]);

  const mergedListings = useMemo<ListingWithSyncState[]>(() => {
    const serverListings = listings || [];
    if (pendingListings.length === 0) return serverListings;

    const serverRequestIds = new Set(
      serverListings
        .map((listing) => listing.clientRequestId)
        .filter((id): id is string => Boolean(id))
    );

    const unsynced = pendingListings.filter(
      (listing) =>
        !listing.clientRequestId ||
        !serverRequestIds.has(listing.clientRequestId)
    );

    return [...unsynced, ...serverListings];
  }, [listings, pendingListings]);

  function handleDelete(id: string, name: string) {
    Alert.alert("Delete Listing", `Remove "${name}" from your listings?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  }

  if (!isFarmer) return <FarmerAccessRequired />;
  if (isLoading) return <Loading />;

  function renderItem({ item }: { item: ListingWithSyncState }) {
    const cat = CROP_CATEGORIES.find((c) => c.value === item.category);
    return (
      <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {cat?.emoji} {item.cropName}
            </Text>
            <Text className="text-primary-700 font-bold mt-1">
              {formatCurrency(item.pricePerUnit)}/{item.unit}
            </Text>
            <View className="flex-row gap-2 mt-2">
              <Badge
                label={`${item.quantity} ${item.unit}`}
                color={item.quantity > 0 ? "green" : "red"}
              />
              {item.pendingSync ? (
                <Badge label="Waiting for Sync" color="yellow" />
              ) : (
                <Badge
                  label={item.active ? "Active" : "Inactive"}
                  color={item.active ? "blue" : "gray"}
                />
              )}
            </View>
          </View>

          {item.pendingSync ? null : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push(`/edit-listing/${item._id}`)}
                className="bg-blue-50 rounded-lg p-2"
              >
                <Ionicons name="create-outline" size={20} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item._id, item.cropName)}
                className="bg-red-50 rounded-lg p-2"
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={mergedListings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState
            icon="🌿"
            title="No Listings"
            message="Create your first listing to start selling"
            actionLabel="Create Listing"
            onAction={() => router.push("/create-listing")}
          />
        }
      />

      {/* FAB - Create Listing */}
      <TouchableOpacity
        onPress={() => router.push("/create-listing")}
        className="absolute bottom-24 right-5 bg-primary-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
