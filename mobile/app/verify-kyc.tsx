import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useVerifyKyc } from "../src/hooks/useFarmer";
import { Button, Input } from "../src/components/ui";
import { getErrorMessage } from "../src/utils/helpers";

export default function VerifyKycScreen() {
  const router = useRouter();
  const verifyKyc = useVerifyKyc();

  const [nationalId, setNationalId] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  async function handleVerify() {
    if (!nationalId.trim() || !fullName.trim() || !dateOfBirth.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const result = await verifyKyc.mutateAsync({
        nationalId: nationalId.trim(),
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth.trim(),
      });

      if (result.data.kycVerified) {
        Alert.alert("Verified!", "Your identity has been verified.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "Verification Failed",
          result.data.message || "Please check your details and try again."
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
          title: "KYC Verification",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        className="flex-1 bg-white px-5 pt-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-6">
          <Text className="text-5xl mb-3">🪪</Text>
          <Text className="text-xl font-bold text-gray-900">
            Verify Your Identity
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2">
            We use Nokia's KYC Match API to securely verify your identity
            against your mobile operator's records.
          </Text>
        </View>

        <Input
          label="National ID Number"
          placeholder="Enter your national ID"
          value={nationalId}
          onChangeText={setNationalId}
        />

        <Input
          label="Full Legal Name"
          placeholder="As it appears on your ID"
          value={fullName}
          onChangeText={setFullName}
        />

        <Input
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
        />

        <View className="mt-4 mb-8">
          <Button
            title="Verify Identity"
            onPress={handleVerify}
            loading={verifyKyc.isPending}
          />
        </View>

        <View className="bg-blue-50 rounded-xl p-4 mb-8">
          <Text className="text-xs text-blue-700">
            🔒 Your data is securely verified via Nokia Network-as-Code CAMARA
            APIs. We do not store your national ID number.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
