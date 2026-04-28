import { api } from "./client";
import type {
  ApiMessage,
  CreateListingInput,
  Listing,
  ListingFilters,
  PaginatedListings,
  UpdateListingInput,
} from "../types";

export const listingsApi = {
  getAll(filters?: ListingFilters) {
    return api.get<PaginatedListings>("/listings", { params: filters });
  },
  getOne(id: string) {
    return api.get<{ listing: Listing }>(`/listings/${id}`);
  },
  getMine(params?: { page?: number; limit?: number }) {
    return api.get<PaginatedListings>("/listings/user/mine", { params });
  },
  create(data: CreateListingInput) {
    return api.post<{ listing: Listing }>("/listings", data);
  },
  update(id: string, data: UpdateListingInput) {
    return api.put<{ listing: Listing }>(`/listings/${id}`, data);
  },
  delete(id: string) {
    return api.delete<ApiMessage>(`/listings/${id}`);
  },
};
