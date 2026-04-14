import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
}: ButtonProps) {
  const baseClasses =
    "rounded-xl py-4 px-6 flex-row items-center justify-center";

  const variantClasses = {
    primary: "bg-primary-600",
    secondary: "bg-accent-500",
    outline: "border-2 border-primary-600 bg-transparent",
    danger: "bg-red-500",
  };

  const textClasses = {
    primary: "text-white font-semibold text-base",
    secondary: "text-white font-semibold text-base",
    outline: "text-primary-600 font-semibold text-base",
    danger: "text-white font-semibold text-base",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${
        fullWidth ? "w-full" : ""
      } ${disabled ? "opacity-50" : ""}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#16a34a" : "#fff"} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={textClasses[variant]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
