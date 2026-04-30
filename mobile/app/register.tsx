import { useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";
import { Button, Input, PhoneInput } from "../src/components/ui";
import type { Country } from "../src/components/ui/PhoneInput";
import { KeyboardAwareScrollView } from "../src/components/layout/KeyboardAwareScrollView";
import { COUNTRIES, buildFullPhone } from "../src/utils/phone";
import { getErrorMessage } from "../src/utils/helpers";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === "NG") ?? COUNTRIES[0]
  );
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"farmer" | "buyer">("farmer");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleRegister() {
    if (!name.trim() || !phone.trim() || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(
        name.trim(),
        buildFullPhone(country, phone),
        password,
        role
      );
      router.replace("/(tabs)");
    } catch (err: unknown) {
      Alert.alert("Registration Failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      className="bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      extraBottom={32}
      extraTop={24}
      includeTopInset
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-5xl mb-3">🌱</Text>
          <Text className="text-3xl font-bold text-primary-800">
            Join AgriConnect
          </Text>
          <Text className="text-base text-gray-500 mt-1">
            Create your account to start trading
          </Text>
        </View>

        {/* Role Selector */}
        <View className="flex-row mb-6 bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setRole("farmer")}
            className={`flex-1 py-3 rounded-lg items-center ${
              role === "farmer" ? "bg-primary-600" : ""
            }`}
          >
            <Text
              className={`font-semibold ${
                role === "farmer" ? "text-white" : "text-gray-600"
              }`}
            >
              🧑‍🌾 I'm a Farmer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setRole("buyer")}
            className={`flex-1 py-3 rounded-lg items-center ${
              role === "buyer" ? "bg-primary-600" : ""
            }`}
          >
            <Text
              className={`font-semibold ${
                role === "buyer" ? "text-white" : "text-gray-600"
              }`}
            >
              🛒 I'm a Buyer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Input
          label="Full Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />

        <PhoneInput
          label="Phone Number"
          country={country}
          onCountryChange={setCountry}
          value={phone}
          onChangeText={setPhone}
        />

        <Input
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Input
          label="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View className="mt-2">
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
          />
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary-600 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
