import { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";
import { useUpdateProfile } from "../src/hooks/useFarmer";
import { Button, Input } from "../src/components/ui";
import { getErrorMessage } from "../src/utils/helpers";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name || "");
  const [farmAddress, setFarmAddress] = useState(user?.farmAddress || "");

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        farmAddress: farmAddress.trim() || undefined,
      });
      Alert.alert("Saved", "Profile updated successfully", [
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
          title: "Edit Profile",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        className="flex-1 bg-white px-5 pt-6"
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Full Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Farm Address"
          placeholder="e.g. Ogun State, Nigeria"
          value={farmAddress}
          onChangeText={setFarmAddress}
        />

        <View className="mt-4">
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={updateProfile.isPending}
          />
        </View>
      </ScrollView>
    </>
  );
}
