import { useState } from "react";
import { FileWarning } from "lucide-react";
import { useAdminReports, useUpdateReportStatus } from "../hooks/useReports";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Pagination } from "../components/ui/Pagination";
import { Select } from "../components/ui/Select";
import { Spinner } from "../components/ui/Spinner";
import type { ReportStatus, ReportTargetType } from "../types";
import { formatDate, getApiError, timeAgo } from "../utils/format";

const statusOptions: Array<{ value: ReportStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const targetOptions: Array<{ value: ReportTargetType | ""; label: string }> = [
  { value: "", label: "All targets" },
  { value: "listing", label: "Listing" },
  { value: "order", label: "Order" },
  { value: "user", label: "User" },
  { value: "other", label: "Other" },
];

const statusTone: Record<ReportStatus, "amber" | "blue" | "green" | "red"> = {
  open: "amber",
  reviewing: "blue",
  resolved: "green",
  rejected: "red",
};

export function AdminReportsPage() {
  const [status, setStatus] = useState<ReportStatus | "">("");
  const [targetType, setTargetType] = useState<ReportTargetType | "">("");
  const [page, setPage] = useState(1);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { data, isLoading, isError, error } = useAdminReports({
    status,
    targetType,
    page,
    limit: 20,
  });
  const updateReportStatus = useUpdateReportStatus();

  async function handleStatusUpdate(reportId: string, nextStatus: ReportStatus) {
    setMessage(null);
    setActiveReportId(reportId);
    try {
      await updateReportStatus.mutateAsync({ id: reportId, status: nextStatus });
      setMessage({
        type: "success",
        text: `Report moved to ${nextStatus}.`,
      });
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    } finally {
      setActiveReportId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem_16rem] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-sun-100 px-3 py-1 text-xs font-black text-sun-800">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-black text-stone-950">Reports</h1>
            <p className="mt-2 text-sm text-stone-600">
              Review marketplace issues and update report status.
            </p>
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ReportStatus | "");
              setPage(1);
            }}
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            label="Target"
            value={targetType}
            onChange={(event) => {
              setTargetType(event.target.value as ReportTargetType | "");
              setPage(1);
            }}
          >
            {targetOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </section>

      {message ? <Alert type={message.type}>{message.text}</Alert> : null}
      {isError ? <Alert type="error">{getApiError(error)}</Alert> : null}

      {isLoading ? (
        <Spinner label="Loading reports" />
      ) : data?.reports.length ? (
        <div className="space-y-3">
          {data.reports.map((report) => (
            <article
              key={report._id}
              className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-stone-950">
                    {report.reason}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">
                    {report.targetType} report {report.targetId ? `#${report.targetId}` : ""}
                  </p>
                </div>
                <Badge tone={statusTone[report.status]} className="capitalize">
                  {report.status}
                </Badge>
              </div>

              {report.description ? (
                <p className="mt-3 text-sm text-stone-700">{report.description}</p>
              ) : null}

              <div className="mt-4 grid gap-2 text-xs text-stone-500 sm:grid-cols-2">
                <p>
                  Reporter: {report.reporter?.name || "Unknown"} (
                  {report.reporter?.phone || "No phone"})
                </p>
                <p>
                  Created: {formatDate(report.createdAt)} ({timeAgo(report.createdAt)})
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStatusUpdate(report._id, "reviewing")}
                  isLoading={
                    activeReportId === report._id &&
                    updateReportStatus.isPending
                  }
                  disabled={report.status === "reviewing"}
                >
                  Mark reviewing
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStatusUpdate(report._id, "resolved")}
                  isLoading={
                    activeReportId === report._id &&
                    updateReportStatus.isPending
                  }
                  disabled={report.status === "resolved"}
                >
                  Mark resolved
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStatusUpdate(report._id, "rejected")}
                  isLoading={
                    activeReportId === report._id &&
                    updateReportStatus.isPending
                  }
                  disabled={report.status === "rejected"}
                >
                  Reject
                </Button>
              </div>
            </article>
          ))}
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState
          icon={<FileWarning className="h-7 w-7" />}
          title="No reports found"
          message="Try another filter or check back when users submit new reports."
        />
      )}
    </div>
  );
}
