import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COUNTRIES,
  type Country,
  normalizeLocalNumber,
  validatePhone,
} from "../../utils/phone";

interface PhoneInputProps {
  label?: string;
  country: Country;
  onCountryChange: (country: Country) => void;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
}

export function PhoneInput({
  label = "Phone Number",
  country,
  onCountryChange,
  value,
  onChangeText,
  error,
}: PhoneInputProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </Text>
      ) : null}

      <View
        className={`flex-row items-center border rounded-xl bg-white ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      >
        {/* Country selector button */}
        <TouchableOpacity
          onPress={() => setPickerVisible(true)}
          className="flex-row items-center px-3 py-3.5 border-r border-gray-200"
        >
          <Text className="text-2xl mr-1">{country.flag}</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color="#6b7280"
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>

        {/* Phone input */}
        <TextInput
          className="flex-1 px-3 py-3.5 text-base text-gray-900"
          placeholder="Phone number"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          value={value}
          onChangeText={onChangeText}
          maxLength={country.maxLength + 1}
        />
      </View>

      {error ? (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      ) : null}

      {/* Country picker modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View className="flex-1 bg-white pt-4">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">
              Select Country
            </Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5">
              <Ionicons name="search-outline" size={18} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-900"
                placeholder="Search country or code..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>
          </View>

          {/* Country list */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onCountryChange(item);
                  setPickerVisible(false);
                  setSearch("");
                }}
                className={`flex-row items-center px-4 py-3.5 border-b border-gray-50 ${
                  item.code === country.code ? "bg-primary-50" : ""
                }`}
              >
                <Text className="text-xl mr-3">{item.flag}</Text>
                <Text className="flex-1 text-base text-gray-900">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-500 mr-2">{item.dial}</Text>
                {item.code === country.code && (
                  <Ionicons name="checkmark" size={20} color="#16a34a" />
                )}
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="items-center py-10">
                <Text className="text-gray-400">No countries found</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

export { COUNTRIES, normalizeLocalNumber, validatePhone };
export type { Country };
