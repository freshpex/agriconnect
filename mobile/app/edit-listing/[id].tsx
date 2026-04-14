import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useListing, useUpdateListing } from "../../src/hooks/useListings";
import { Button, Input, Loading } from "../../src/components/ui";
import { CROP_CATEGORIES, getErrorMessage } from "../../src/utils/helpers";

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading } = useListing(id);
  const updateListing = useUpdateListing();
  const router = useRouter();

  const [cropName, setCropName] = useState("");
  const [category, setCategory] = useState("other");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (listing) {
      setCropName(listing.cropName);
      setCategory(listing.category);
      setQuantity(String(listing.quantity));
      setUnit(listing.unit);
      setPricePerUnit(String(listing.pricePerUnit));
      setDescription(listing.description || "");
      setActive(listing.active);
    }
  }, [listing]);

  if (isLoading) return <Loading />;

  async function handleSave() {
    if (!cropName.trim() || !quantity || !pricePerUnit) {
      Alert.alert("Error", "Please fill in crop name, quantity, and price");
      return;
    }

    try {
      await updateListing.mutateAsync({
        id,
        data: {
          cropName: cropName.trim(),
          category,
          quantity: parseFloat(quantity),
          unit,
          pricePerUnit: parseFloat(pricePerUnit),
          description: description.trim() || undefined,
          active,
        },
      });
      Alert.alert("Updated", "Listing updated successfully", [
        { text: "OK", onPress: () => router.back() },
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
          title: "Edit Listing",
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-white px-5 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Crop Name"
            value={cropName}
            onChangeText={setCropName}
          />

          <Text className="text-sm font-medium text-gray-700 mb-2">
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {CROP_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-full ${
                  category === cat.value ? "bg-primary-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm ${
                    category === cat.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {cat.emoji} {cat.label.replace(/^.+\s/, "")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input label="Unit" value={unit} onChangeText={setUnit} />
            </View>
          </View>

          <Input
            label="Price per Unit (NGN)"
            value={pricePerUnit}
            onChangeText={setPricePerUnit}
            keyboardType="numeric"
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Active Toggle */}
          <TouchableOpacity
            onPress={() => setActive(!active)}
            className={`flex-row items-center justify-between p-4 rounded-xl mb-4 ${
              active ? "bg-green-50" : "bg-gray-100"
            }`}
          >
            <Text className="text-base text-gray-800">Listing Active</Text>
            <View
              className={`w-12 h-7 rounded-full justify-center ${
                active ? "bg-primary-600 items-end" : "bg-gray-300 items-start"
              }`}
            >
              <View className="w-5 h-5 rounded-full bg-white mx-1" />
            </View>
          </TouchableOpacity>

          <View className="mb-8">
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={updateListing.isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
