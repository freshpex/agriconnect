import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./ui";

export function FarmerAccessRequired() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50 px-6 justify-center">
      <View className="bg-white rounded-2xl p-6 border border-amber-100">
        <View className="w-14 h-14 rounded-2xl bg-amber-50 items-center justify-center mb-4">
          <Ionicons name="shield-outline" size={28} color="#b45309" />
        </View>
        <Text className="text-xs font-bold uppercase text-amber-700 mb-2">
          Farmer access required
        </Text>
        <Text className="text-2xl font-bold text-gray-900">
          Listings are only available to farmer accounts.
        </Text>
        <Text className="text-base text-gray-600 mt-3 leading-6">
          Buyer accounts cannot create, edit, deactivate, or manage produce
          listings. Request an account type change from your profile to unlock
          farmer listing tools after approval.
        </Text>
        <View className="mt-6 gap-3">
          <Button
            title="Request farmer access"
            onPress={() => router.push("/(tabs)/profile")}
          />
          <Button
            title="Back to marketplace"
            variant="outline"
            onPress={() => router.replace("/(tabs)")}
          />
        </View>
      </View>
    </View>
  );
}
