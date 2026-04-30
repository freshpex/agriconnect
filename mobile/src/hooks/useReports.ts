import { useMutation } from "@tanstack/react-query";
import { reportsApi } from "../api/reports";

export function useCreateReport() {
  return useMutation({
    mutationFn: reportsApi.create,
  });
}
