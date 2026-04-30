import api from "./client";
import type { Report, ReportCreateInput } from "../types";

export const reportsApi = {
  create(data: ReportCreateInput) {
    return api.post<{ report: Report }>("/reports", data);
  },
};
