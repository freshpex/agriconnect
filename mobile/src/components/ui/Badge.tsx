import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  color?: "green" | "red" | "yellow" | "blue" | "purple" | "gray";
}

const colors = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  gray: "bg-gray-100 text-gray-600",
};

export function Badge({ label, color = "gray" }: BadgeProps) {
  const bgClass = colors[color].split(" ")[0];
  const textClass = colors[color].split(" ")[1];

  return (
    <View className={`${bgClass} rounded-full px-3 py-1`}>
      <Text className={`${textClass} text-xs font-medium`}>{label}</Text>
    </View>
  );
}
