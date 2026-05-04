import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useAdminReports, useUpdateReportStatus } from "../../src/hooks/useReports";
import { Badge, Button, EmptyState, Loading } from "../../src/components/ui";
import type { Report, ReportStatus } from "../../src/types";
import { formatDate, getErrorMessage } from "../../src/utils/helpers";

const statusFilters: Array<{ label: string; value: ReportStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Resolved", value: "resolved" },
  { label: "Rejected", value: "rejected" },
];

function statusBadgeColor(status: ReportStatus): "yellow" | "blue" | "green" | "red" {
  if (status === "reviewing") return "blue";
  if (status === "resolved") return "green";
  if (status === "rejected") return "red";
  return "yellow";
}

export default function ReportsScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<ReportStatus | "">("");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const { data, isLoading } = useAdminReports({ status, page: 1, limit: 50 });
  const updateReportStatus = useUpdateReportStatus();

  if (user?.role !== "admin") {
    return (
      <EmptyState
        icon="🛡️"
        title="Admin Only"
        message="Only admin accounts can view reports."
      />
    );
  }

  if (isLoading) return <Loading message="Loading reports..." />;

  async function handleStatusUpdate(reportId: string, nextStatus: ReportStatus) {
    setActiveReportId(reportId);
    try {
      await updateReportStatus.mutateAsync({ id: reportId, status: nextStatus });
      Alert.alert("Updated", `Report moved to ${nextStatus}.`);
    } catch (err) {
      Alert.alert("Update failed", getErrorMessage(err));
    } finally {
      setActiveReportId(null);
    }
  }

  const reports = data?.reports || [];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-3 pb-2">
        <Text className="text-xl font-bold text-gray-900">Reports</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Review marketplace reports and update status.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
      >
        <View className="flex-row gap-2">
          {statusFilters.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => setStatus(item.value)}
              className={`px-3 py-2 rounded-full border ${
                status === item.value
                  ? "bg-primary-600 border-primary-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  status === item.value ? "text-white" : "text-gray-600"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            busy={activeReportId === item._id && updateReportStatus.isPending}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="No reports found"
            message="Try a different status filter."
          />
        }
      />
    </View>
  );
}

function ReportCard({
  report,
  busy,
  onStatusUpdate,
}: {
  report: Report;
  busy: boolean;
  onStatusUpdate: (reportId: string, status: ReportStatus) => Promise<void>;
}) {
  return (
    <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{report.reason}</Text>
          <Text className="text-xs uppercase text-gray-500 mt-1">
            {report.targetType}
          </Text>
        </View>
        <Badge
          label={report.status}
          color={statusBadgeColor(report.status)}
        />
      </View>

      {report.description ? (
        <Text className="text-sm text-gray-600 mt-3 leading-5">
          {report.description}
        </Text>
      ) : null}

      <Text className="text-xs text-gray-500 mt-3">
        Reporter: {report.reporter?.name || "Unknown"} ({report.reporter?.phone || "No phone"})
      </Text>
      <Text className="text-xs text-gray-500 mt-1">
        Created: {formatDate(report.createdAt)}
      </Text>

      <View className="flex-row flex-wrap gap-2 mt-3">
        <Button
          title="Reviewing"
          onPress={() => onStatusUpdate(report._id, "reviewing")}
          variant="outline"
          loading={busy}
          fullWidth={false}
        />
        <Button
          title="Resolve"
          onPress={() => onStatusUpdate(report._id, "resolved")}
          variant="outline"
          loading={busy}
          fullWidth={false}
        />
        <Button
          title="Reject"
          onPress={() => onStatusUpdate(report._id, "rejected")}
          variant="outline"
          loading={busy}
          fullWidth={false}
        />
      </View>
    </View>
  );
}
