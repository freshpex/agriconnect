import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import * as Location from "expo-location";
import { useVerifyLocation } from "../src/hooks/useFarmer";
import { KeyboardAwareScrollView } from "../src/components/layout/KeyboardAwareScrollView";
import { Button } from "../src/components/ui";
import { getErrorMessage } from "../src/utils/helpers";

export default function VerifyLocationScreen() {
  const router = useRouter();
  const verifyLocation = useVerifyLocation();
  const [gettingLocation, setGettingLocation] = useState(false);

  async function handleVerify() {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is needed for verification"
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const result = await verifyLocation.mutateAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (result.data.locationVerified) {
        Alert.alert(
          "Location Verified!",
          "Your farm location has been verified via Nokia's Location Verification API.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          "Verification Failed",
          `Result: ${result.data.verificationResult}. Make sure you are at your farm location and try again.`
        );
      }
    } catch (err: unknown) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setGettingLocation(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Location Verification",
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAwareScrollView
        className="bg-white"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        extraBottom={32}
        extraTop={24}
      >
        <View className="items-center mb-8">
          <Text className="text-5xl mb-3">📍</Text>
          <Text className="text-xl font-bold text-gray-900">
            Verify Your Farm Location
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2 px-4">
            Nokia's Location Verification API checks that your device is
            physically near the coordinates you claim, preventing fake listings.
          </Text>
        </View>

        <View className="bg-green-50 rounded-xl p-4 mb-6">
          <Text className="text-sm text-green-800 font-medium mb-1">
            How it works
          </Text>
          <Text className="text-xs text-green-700">
            1. We get your current GPS coordinates{"\n"}
            2. Your mobile operator verifies your device is physically at that
            location{"\n"}
            3. Your farm location gets a verified badge
          </Text>
        </View>

        <Button
          title="Verify My Farm Location"
          onPress={handleVerify}
          loading={gettingLocation || verifyLocation.isPending}
        />

        <Text className="text-xs text-gray-400 text-center mt-4">
          Make sure you are at your farm when verifying
        </Text>
      </KeyboardAwareScrollView>
    </>
  );
}
