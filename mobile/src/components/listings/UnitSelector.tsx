import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { UNIT_OPTIONS } from "../../utils/helpers";

interface UnitSelectorProps {
  value: string;
  onChange: (unit: string) => void;
  label?: string;
}

export function UnitSelector({
  value,
  onChange,
  label = "Unit",
}: UnitSelectorProps) {
  const units =
    value && !UNIT_OPTIONS.includes(value as (typeof UNIT_OPTIONS)[number])
      ? [value, ...UNIT_OPTIONS]
      : UNIT_OPTIONS;

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="-mx-1"
        contentContainerStyle={{ paddingHorizontal: 4, paddingRight: 24 }}
      >
        {units.map((unit) => {
          const selected = value === unit;

          return (
            <TouchableOpacity
              key={unit}
              onPress={() => onChange(unit)}
              activeOpacity={0.8}
              style={{ minWidth: 64 }}
              className={`mr-2 rounded-lg px-3 py-2.5 items-center ${
                selected ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs ${
                  selected ? "text-white font-medium" : "text-gray-700"
                }`}
              >
                {unit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
