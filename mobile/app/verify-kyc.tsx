import { useState } from "react";
import { View, Text, ScrollView, Alert, Platform } from "react-native";
import { useRouter, Stack } from "expo-router";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useVerifyKyc } from "../src/hooks/useFarmer";
import { Button, Input } from "../src/components/ui";
import { getErrorMessage } from "../src/utils/helpers";

const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function parseDateString(value: string): Date | null {
  if (!DATE_INPUT_REGEX.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

export default function VerifyKycScreen() {
  const router = useRouter();
  const verifyKyc = useVerifyKyc();

  const [nationalId, setNationalId] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(() => new Date());

  function handleOpenDatePicker() {
    const parsedDate = parseDateString(dateOfBirth.trim());
    setPickerDate(parsedDate ?? new Date());
    setShowDatePicker(true);
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed") {
      return;
    }

    if (selectedDate) {
      setPickerDate(selectedDate);
      setDateOfBirth(formatDateToString(selectedDate));
    }
  }

  async function handleVerify() {
    const trimmedDate = dateOfBirth.trim();
    if (!nationalId.trim() || !fullName.trim() || !trimmedDate) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!parseDateString(trimmedDate)) {
      Alert.alert(
        "Invalid Date",
        "Please enter a valid date (YYYY-MM-DD) or pick one from the calendar."
      );
      return;
    }

    try {
      const result = await verifyKyc.mutateAsync({
        nationalId: nationalId.trim(),
        fullName: fullName.trim(),
        dateOfBirth: trimmedDate,
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
          onChangeText={(value) => setDateOfBirth(normalizeDateInput(value))}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={10}
        />

        <View className="mb-4">
          <Button
            title="Pick date"
            variant="outline"
            fullWidth={false}
            onPress={handleOpenDatePicker}
          />
        </View>

        {showDatePicker ? (
          <View className="mb-4">
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
            {Platform.OS === "ios" ? (
              <View className="mt-3">
                <Button
                  title="Done"
                  variant="outline"
                  fullWidth={false}
                  onPress={() => setShowDatePicker(false)}
                />
              </View>
            ) : null}
          </View>
        ) : null}

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
