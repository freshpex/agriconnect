import { useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useCreateReport } from "../src/hooks/useReports";
import { Button, Input } from "../src/components/ui";
import type { ReportTargetType } from "../src/types";

const REASONS = [
  { value: "scam", label: "Possible scam/fraud" },
  { value: "location", label: "Wrong or fake location" },
  { value: "quality", label: "Quality/condition dispute" },
  { value: "other", label: "Other" },
] as const;

type ReportReason = (typeof REASONS)[number]["value"];

const TARGET_TYPES: ReportTargetType[] = ["listing", "order", "user", "other"];

export default function ReportIssueScreen() {
  const { targetType, targetId } = useLocalSearchParams<{
    targetType?: string;
    targetId?: string;
  }>();
  const router = useRouter();
  const createReport = useCreateReport();
  const [reason, setReason] = useState<ReportReason>(REASONS[0].value);
  const [description, setDescription] = useState("");

  const resolvedTargetType = TARGET_TYPES.includes(
    targetType as ReportTargetType
  )
    ? (targetType as ReportTargetType)
    : "listing";

  async function handleSubmit() {
    if (!targetId) {
      Alert.alert("Missing target", "No issue target was provided.");
      return;
    }

    try {
      await createReport.mutateAsync({
        targetType: resolvedTargetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });
      Alert.alert("Report submitted", "Thanks for flagging this issue.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Report failed", "Please try again later.");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Report Issue",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView className="flex-1 bg-white px-5 pt-6">
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900">Report issue</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Tell us what went wrong so an admin can review the case.
          </Text>
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-2">Reason</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {REASONS.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setReason(item.value)}
              className={`px-4 py-2 rounded-full ${
                reason === item.value ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm ${
                  reason === item.value
                    ? "text-white font-medium"
                    : "text-gray-700"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Details"
          placeholder="Share relevant details (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Button
          title="Submit report"
          onPress={handleSubmit}
          loading={createReport.isPending}
        />
      </ScrollView>
    </>
  );
}
