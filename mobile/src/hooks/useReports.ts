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
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) =>
      reportsApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}
