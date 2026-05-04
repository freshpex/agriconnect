import api from "./client";
import type {
  PaginatedReports,
  Report,
  ReportCreateInput,
  ReportStatus,
  ReportTargetType,
} from "../types";

export const reportsApi = {
  create(data: ReportCreateInput) {
    return api.post<{ report: Report }>("/reports", data);
  },
  getAll(params?: {
    status?: ReportStatus | "";
    targetType?: ReportTargetType | "";
    page?: number;
    limit?: number;
  }) {
    return api.get<PaginatedReports>("/reports", { params });
  },
  updateStatus(
    id: string,
    data: {
      status?: ReportStatus;
      resolutionNote?: string;
      assignedTo?: string;
    }
  ) {
    return api.patch<{ report: Report }>(`/reports/${id}`, data);
  },
};
