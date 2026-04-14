import { View, Text, TouchableOpacity } from "react-native";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          className="bg-primary-600 rounded-xl px-8 py-3"
        >
          <Text className="text-white font-semibold text-base">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
