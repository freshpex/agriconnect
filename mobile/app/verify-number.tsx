import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useVerifyNumber } from "../src/hooks/useFarmer";
import { Button } from "../src/components/ui";
import { getErrorMessage } from "../src/utils/helpers";

export default function VerifyNumberScreen() {
  const router = useRouter();
  const verifyNumber = useVerifyNumber();

  async function handleVerify() {
    try {
      const result = await verifyNumber.mutateAsync();

      if (result.data.numberVerified) {
        Alert.alert(
          "Verified!",
          "Your phone number has been verified at the network level.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          "Verification Failed",
          "Your phone number could not be verified. Make sure you are using mobile data (not WiFi)."
        );
      }
    } catch (err: unknown) {
      Alert.alert("Error", getErrorMessage(err));
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Number Verification",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView className="flex-1 bg-white px-5 pt-6">
        <View className="items-center mb-8">
          <Text className="text-5xl mb-3">📱</Text>
          <Text className="text-xl font-bold text-gray-900">
            Verify Your Phone Number
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2 px-4">
            Nokia's Number Verification API silently checks that the phone
            number registered in your app matches the SIM card in your device.
          </Text>
        </View>

        <View className="bg-amber-50 rounded-xl p-4 mb-6">
          <Text className="text-sm text-amber-800 font-medium mb-1">
            Important
          </Text>
          <Text className="text-xs text-amber-700">
            • Make sure you are connected via mobile data (not WiFi){"\n"}• The
            verification happens instantly at the network level{"\n"}• No OTP or
            SMS is needed
          </Text>
        </View>

        <Button
          title="Verify My Number"
          onPress={handleVerify}
          loading={verifyNumber.isPending}
        />
      </ScrollView>
    </>
  );
}
