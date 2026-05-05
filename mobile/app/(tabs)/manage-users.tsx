import { useState } from "react";
import { View, Text, FlatList, Alert, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import {
  useDeleteUser,
  useAdminUsers,
  useReviewFarmerAccess,
  useUpdateUser,
} from "../../src/hooks/useAdmin";
import { Badge, Button, EmptyState, Input, Loading } from "../../src/components/ui";
import type { AccountTypeChangeStatus, User } from "../../src/types";
import { formatDate, getErrorMessage } from "../../src/utils/helpers";

type RoleFilter = User["role"] | "";

const roleFilters: Array<{ label: string; value: RoleFilter }> = [
  { label: "All", value: "" },
  { label: "Farmer", value: "farmer" },
  { label: "Buyer", value: "buyer" },
  { label: "Admin", value: "admin" },
];

const requestFilters: Array<{
  label: string;
  value: AccountTypeChangeStatus | "";
}> = [
  { label: "Any request", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

function getUserId(user: User): string {
  return user._id || user.id;
}

function roleBadgeColor(role: User["role"]): "green" | "yellow" | "purple" {
  if (role === "farmer") return "green";
  if (role === "admin") return "purple";
  return "yellow";
}

export default function ManageUsersScreen() {
  const { user } = useAuth();
  const [role, setRole] = useState<RoleFilter>("");
  const [requestStatus, setRequestStatus] = useState<AccountTypeChangeStatus | "">(
    ""
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const { data, isLoading } = useAdminUsers({
    role,
    requestStatus,
    search,
    page: 1,
    limit: 50,
  });
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const reviewFarmerAccess = useReviewFarmerAccess();

  if (user?.role !== "admin") {
    return (
      <EmptyState
        icon="🛡️"
        title="Admin Only"
        message="Only admin accounts can manage users."
      />
    );
  }

  if (isLoading) return <Loading message="Loading users..." />;

  async function approveFarmerAccess(target: User) {
    const id = getUserId(target);
    setActiveUserId(id);
    try {
      await reviewFarmerAccess.mutateAsync({ id, status: "approved" });
      Alert.alert("Updated", "Farmer access approved.");
    } catch (err) {
      Alert.alert("Update failed", getErrorMessage(err));
    } finally {
      setActiveUserId(null);
    }
  }

  async function rejectFarmerAccess(target: User) {
    const id = getUserId(target);
    setActiveUserId(id);
    try {
      await reviewFarmerAccess.mutateAsync({ id, status: "rejected" });
      Alert.alert("Updated", "Farmer access request rejected.");
    } catch (err) {
      Alert.alert("Update failed", getErrorMessage(err));
    } finally {
      setActiveUserId(null);
    }
  }

  async function setFarmer(target: User) {
    const id = getUserId(target);
    setActiveUserId(id);
    try {
      await updateUser.mutateAsync({ id, role: "farmer" });
      Alert.alert("Updated", "User role changed to farmer.");
    } catch (err) {
      Alert.alert("Update failed", getErrorMessage(err));
    } finally {
      setActiveUserId(null);
    }
  }

  function deleteUserWithConfirm(target: User) {
    Alert.alert(
      "Delete user",
      `Delete ${target.name} (${target.phone})? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const id = getUserId(target);
            setActiveUserId(id);
            try {
              const response = await deleteUser.mutateAsync(id);
              Alert.alert("Deleted", response.data.message);
            } catch (err) {
              Alert.alert("Delete failed", getErrorMessage(err));
            } finally {
              setActiveUserId(null);
            }
          },
        },
      ]
    );
  }

  const users = data?.users || [];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-3">
        <Text className="text-xl font-bold text-gray-900">Manage Users</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Handle farmer access requests and user roles.
        </Text>
      </View>

      <View className="px-4 mt-3">
        <Input
          label="Search name or phone"
          placeholder="e.g. Amina or +234..."
          value={searchInput}
          onChangeText={setSearchInput}
        />
        <View className="flex-row gap-2 mb-2">
          <Button
            title="Search"
            onPress={() => setSearch(searchInput.trim())}
            fullWidth={false}
          />
          {search ? (
            <Button
              title="Clear"
              onPress={() => {
                setSearchInput("");
                setSearch("");
              }}
              variant="outline"
              fullWidth={false}
            />
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
      >
        <View className="flex-row gap-2">
          {roleFilters.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => setRole(item.value)}
              className={`px-3 py-2 rounded-full border ${
                role === item.value
                  ? "bg-primary-600 border-primary-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  role === item.value ? "text-white" : "text-gray-600"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
      >
        <View className="flex-row gap-2">
          {requestFilters.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => setRequestStatus(item.value)}
              className={`px-3 py-2 rounded-full border ${
                requestStatus === item.value
                  ? "bg-primary-600 border-primary-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  requestStatus === item.value ? "text-white" : "text-gray-600"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <FlatList
        data={users}
        keyExtractor={(item) => getUserId(item)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
        renderItem={({ item }) => {
          const isPendingRequest =
            item.accountTypeChangeRequest?.status === "pending";
          const isBusy =
            activeUserId === getUserId(item) &&
            (updateUser.isPending ||
              reviewFarmerAccess.isPending ||
              deleteUser.isPending);

          return (
            <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">{item.phone}</Text>
                </View>
                <View className="items-end gap-1">
                  <Badge label={item.role} color={roleBadgeColor(item.role)} />
                  <Badge
                    label={item.isActive ? "active" : "deactivated"}
                    color={item.isActive ? "blue" : "red"}
                  />
                  {item.accountTypeChangeRequest ? (
                    <Badge
                      label={`request: ${item.accountTypeChangeRequest.status}`}
                      color={
                        item.accountTypeChangeRequest.status === "rejected"
                          ? "red"
                          : "yellow"
                      }
                    />
                  ) : null}
                </View>
              </View>

              <Text className="text-xs text-gray-500 mt-3">
                Joined: {formatDate(item.createdAt)}
              </Text>

              <View className="flex-row flex-wrap gap-2 mt-3">
                {isPendingRequest ? (
                  <>
                    <Button
                      title="Approve Access"
                      onPress={() => approveFarmerAccess(item)}
                      loading={isBusy}
                      fullWidth={false}
                    />
                    <Button
                      title="Reject"
                      onPress={() => rejectFarmerAccess(item)}
                      loading={isBusy}
                      variant="outline"
                      fullWidth={false}
                    />
                  </>
                ) : item.role !== "farmer" ? (
                  <Button
                    title="Set as Farmer"
                    onPress={() => setFarmer(item)}
                    loading={isBusy}
                    variant="outline"
                    fullWidth={false}
                  />
                ) : null}
                <Button
                  title="Delete User"
                  onPress={() => deleteUserWithConfirm(item)}
                  loading={isBusy}
                  variant="danger"
                  fullWidth={false}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="No users found"
            message="Try a different filter or search."
          />
        }
      />
    </View>
  );
}
