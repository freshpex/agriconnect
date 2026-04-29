import { View, ActivityIndicator, Text } from "react-native";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#16a34a" />
      <Text className="mt-3 text-gray-500 text-base">{message}</Text>
    </View>
  );
}
