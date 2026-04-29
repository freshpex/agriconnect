import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useListings } from "../../src/hooks/useListings";
import { ListingCard } from "../../src/components/listings/ListingCard";
import { Loading, EmptyState } from "../../src/components/ui";
import { CROP_CATEGORIES } from "../../src/utils/helpers";

export default function MarketplaceScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();

  const { data, isLoading, isRefetching, refetch } = useListings({
    search: search || undefined,
    category: selectedCategory,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <Loading message="Loading marketplace..." />;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="px-4 pt-3 pb-2 bg-white">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search crops..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Filter */}
      <View className="bg-white pb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          data={[
            { value: undefined, label: "All", emoji: "🏪" },
            ...CROP_CATEGORIES,
          ]}
          keyExtractor={(item) => item.value || "all"}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                setSelectedCategory(item.value as string | undefined)
              }
              className={`flex-row items-center px-4 py-2 rounded-full ${
                selectedCategory === item.value
                  ? "bg-primary-600"
                  : "bg-gray-100"
              }`}
            >
              <Text className="mr-1">{item.emoji}</Text>
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === item.value
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {item.label.replace(/^.+\s/, "")}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Listings */}
      <FlatList
        data={data?.listings || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#16a34a"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🌱"
            title="No Listings Yet"
            message="Pull down to refresh or try a different search"
          />
        }
        ListHeaderComponent={
          data?.pagination ? (
            <Text className="text-sm text-gray-500 mb-3">
              {data.pagination.total} listing
              {data.pagination.total !== 1 ? "s" : ""} found
            </Text>
          ) : null
        }
      />
    </View>
  );
}
