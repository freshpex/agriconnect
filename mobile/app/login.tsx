import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";
import { Button, Input } from "../src/components/ui";
import { getErrorMessage } from "../src/utils/helpers";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    if (!phone.trim() || !password) {
      Alert.alert("Error", "Please enter phone and password");
      return;
    }

    setLoading(true);
    try {
      await login(phone.trim(), password);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      Alert.alert("Login Failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="items-center mb-10">
            <Text className="text-5xl mb-3">🌾</Text>
            <Text className="text-3xl font-bold text-primary-800">
              AgriConnect
            </Text>
            <Text className="text-base text-gray-500 mt-1">
              Connecting farmers to buyers
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Input
              label="Phone Number"
              placeholder="+234..."
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button title="Sign In" onPress={handleLogin} loading={loading} />

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-primary-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
