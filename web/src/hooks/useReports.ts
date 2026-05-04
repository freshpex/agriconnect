import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../api/reports";
import type { ReportStatus, ReportTargetType } from "../types";

export function useCreateReport() {
  return useMutation({
    mutationFn: reportsApi.create,
  });
}

export function useAdminReports(params?: {
  status?: ReportStatus | "";
  targetType?: ReportTargetType | "";
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin-reports", params],
    queryFn: () => reportsApi.getAll(params).then((response) => response.data),
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNote,
      assignedTo,
    }: {
      id: string;
      status?: ReportStatus;
      resolutionNote?: string;
      assignedTo?: string;
    }) => reportsApi.updateStatus(id, { status, resolutionNote, assignedTo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}
