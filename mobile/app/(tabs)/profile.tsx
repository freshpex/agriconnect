import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/hooks/useAuth";
import { Badge } from "../../src/components/ui";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-primary-600 pt-12 pb-8 px-6 rounded-b-3xl">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-3">
            <Text className="text-4xl">
              {user?.role === "farmer" ? "🧑‍🌾" : "🛒"}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-white">{user?.name}</Text>
          <Text className="text-primary-200 mt-1">{user?.phone}</Text>
          <View className="flex-row gap-2 mt-3">
            <Badge
              label={user?.role === "farmer" ? "Farmer" : "Buyer"}
              color="green"
            />
            {user?.kycVerified && <Badge label="KYC Verified" color="blue" />}
          </View>
        </View>
      </View>

      {/* Verification Status */}
      <View className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-3">
          🔐 Verification Status
        </Text>

        <VerificationRow
          label="KYC Match"
          verified={user?.kycVerified ?? false}
          onVerify={() => router.push("/verify-kyc")}
        />
        <VerificationRow
          label="Phone Number"
          verified={user?.numberVerified ?? false}
          onVerify={() => router.push("/verify-number")}
        />
        <VerificationRow
          label="Farm Location"
          verified={user?.locationVerified ?? false}
          onVerify={() => router.push("/verify-location")}
        />
        <VerificationRow
          label="SIM Swap Check"
          verified={user?.simSwapChecked ?? false}
          description="Checked automatically on login"
        />
      </View>

      {/* Quick Actions */}
      <View className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Quick Actions
        </Text>

        <ActionRow
          icon="create-outline"
          label="Edit Profile"
          onPress={() => router.push("/edit-profile")}
        />
        {user?.role === "farmer" && (
          <ActionRow
            icon="add-circle-outline"
            label="Create Listing"
            onPress={() => router.push("/create-listing")}
          />
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        className="mx-4 mt-4 mb-8 bg-white rounded-2xl p-4 border border-red-100 flex-row items-center justify-center"
      >
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text className="text-red-500 font-semibold ml-2">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function VerificationRow({
  label,
  verified,
  description,
  onVerify,
}: {
  label: string;
  verified: boolean;
  description?: string;
  onVerify?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
      <View className="flex-1">
        <Text className="text-base text-gray-800">{label}</Text>
        {description ? (
          <Text className="text-xs text-gray-400 mt-0.5">{description}</Text>
        ) : null}
      </View>
      {verified ? (
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
          <Text className="text-green-600 text-sm ml-1">Verified</Text>
        </View>
      ) : onVerify ? (
        <TouchableOpacity
          onPress={onVerify}
          className="bg-primary-50 px-4 py-1.5 rounded-lg"
        >
          <Text className="text-primary-700 text-sm font-medium">Verify</Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-gray-400 text-sm">Pending</Text>
      )}
    </View>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3 border-b border-gray-50"
    >
      <Ionicons name={icon} size={22} color="#16a34a" />
      <Text className="text-base text-gray-800 ml-3 flex-1">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
}
