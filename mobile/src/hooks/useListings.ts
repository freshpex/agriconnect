import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingsApi, type ListingFilters } from "../api/listings";
import type { Listing } from "../types";

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: () => listingsApi.getAll(filters).then((r) => r.data),
  });
}

export function useListing(id: string, enabled = true) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingsApi.getOne(id).then((r) => r.data.listing),
    enabled: enabled && !!id,
  });
}

export function useMyListings(enabled = true) {
  return useQuery({
    queryKey: ["myListings"],
    queryFn: () => listingsApi.getMine().then((r) => r.data.listings),
    enabled,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      listingsApi.update(id, data as Partial<Listing>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
    },
  });
}
