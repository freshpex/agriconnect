import { useState } from "react";
import { View, Text, Alert, TouchableOpacity, Platform } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter, Stack } from "expo-router";
import * as Location from "expo-location";
import { useCreateListing } from "../src/hooks/useListings";
import { useAuth } from "../src/hooks/useAuth";
import { FarmerAccessRequired } from "../src/components/FarmerAccessRequired";
import { UnitSelector } from "../src/components/listings/UnitSelector";
import { KeyboardAwareScrollView } from "../src/components/layout/KeyboardAwareScrollView";
import { Button, Input } from "../src/components/ui";
import { CROP_CATEGORIES, getErrorMessage } from "../src/utils/helpers";

export default function CreateListingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const createListing = useCreateListing();

  const [cropName, setCropName] = useState("");
  const [category, setCategory] = useState("other");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [description, setDescription] = useState("");
  const [farmAddress, setFarmAddress] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [harvestDateValue, setHarvestDateValue] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  async function getCurrentLocation() {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is needed to tag your listing"
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      Alert.alert(
        "Location Set",
        "Your current location has been added to the listing"
      );
    } catch {
      Alert.alert("Error", "Could not get location");
    } finally {
      setGettingLocation(false);
    }
  }

  async function handleSubmit() {
    if (user?.role !== "farmer") {
      Alert.alert(
        "Farmer Access Required",
        "Only farmer accounts can create listings. Request an account type change from your profile."
      );
      return;
    }

    if (!cropName.trim() || !quantity || !pricePerUnit) {
      Alert.alert("Error", "Please fill in crop name, quantity, and price");
      return;
    }

    try {
      await createListing.mutateAsync({
        cropName: cropName.trim(),
        category,
        quantity: parseFloat(quantity),
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
        description: description.trim() || undefined,
        farmAddress: farmAddress.trim() || undefined,
        harvestDate: harvestDate.trim() || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      });

      Alert.alert("Success", "Your listing has been created!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      Alert.alert("Error", getErrorMessage(err));
    }
  }

  function handleDateChange(_event: DateTimePickerEvent, date?: Date) {
    setShowDatePicker(false);
    if (date) {
      setHarvestDateValue(date);
      setHarvestDate(date.toISOString().slice(0, 10));
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Create Listing",
          headerBackTitle: "Back",
        }}
      />
      {user?.role !== "farmer" ? (
        <FarmerAccessRequired />
      ) : (
        <KeyboardAwareScrollView
          className="bg-white"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
          }}
          extraBottom={32}
          extraTop={16}
        >
          <Input
            label="Crop Name"
            placeholder="e.g. Fresh Tomatoes"
            value={cropName}
            onChangeText={setCropName}
          />

          {/* Category Picker */}
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
                    category === cat.value
                      ? "text-white font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {cat.emoji} {cat.label.replace(/^.+\s/, "")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Quantity"
            placeholder="0"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <UnitSelector value={unit} onChange={setUnit} />

          <Input
            label="Price per Unit (NGN)"
            placeholder="0.00"
            value={pricePerUnit}
            onChangeText={setPricePerUnit}
            keyboardType="numeric"
          />

          <Input
            label="Description (optional)"
            placeholder="Describe your produce..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Farm Address (optional)"
            placeholder="e.g. Ogun State, Nigeria"
            value={farmAddress}
            onChangeText={setFarmAddress}
          />

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Harvest Date (optional)
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border rounded-xl px-4 py-3.5 bg-white border-gray-300"
            >
              <Text className="text-base text-gray-900">
                {harvestDate || "Select a date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker ? (
              <DateTimePicker
                value={harvestDateValue ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            ) : null}
          </View>

          {/* Location */}
          <View className="mb-4">
            <Button
              title={
                latitude
                  ? `📍 Location Set (${latitude.toFixed(4)}, ${longitude?.toFixed(4)})`
                  : "📍 Add My Location"
              }
              onPress={getCurrentLocation}
              variant="outline"
              loading={gettingLocation}
            />
          </View>

          <View>
            <Button
              title="Create Listing"
              onPress={handleSubmit}
              loading={createListing.isPending}
            />
          </View>
        </KeyboardAwareScrollView>
      )}
    </>
  );
}
