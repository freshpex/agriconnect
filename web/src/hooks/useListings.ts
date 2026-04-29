import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listingsApi } from "../api/listings";
import type {
  CreateListingInput,
  ListingFilters,
  UpdateListingInput,
} from "../types";

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: () =>
      listingsApi.getAll(filters).then((response) => response.data),
  });
}

export function useListing(id?: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () =>
      listingsApi.getOne(id!).then((response) => response.data.listing),
    enabled: Boolean(id),
  });
}

export function useMyListings(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["my-listings", params],
    queryFn: () =>
      listingsApi.getMine(params).then((response) => response.data),
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListingInput) => listingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingInput }) =>
      listingsApi.update(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing", variables.id] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
