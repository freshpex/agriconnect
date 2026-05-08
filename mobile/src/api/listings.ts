import api from "./client";
import type { Listing, PaginatedResponse } from "../types";

export interface CreateListingInput {
  cropName: string;
  category?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  farmAddress?: string;
  harvestDate?: string;
  clientRequestId?: string;
}

export interface ListingFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export const listingsApi = {
  getAll(filters?: ListingFilters) {
    return api.get<PaginatedResponse<Listing>>("/listings", {
      params: filters,
    });
  },

  getOne(id: string) {
    return api.get<{ listing: Listing }>(`/listings/${id}`);
  },

  getMine() {
    return api.get<{ listings: Listing[] }>("/listings/user/mine");
  },

  create(data: CreateListingInput) {
    return api.post<{ listing: Listing }>("/listings", data);
  },

  update(id: string, data: Partial<Listing>) {
    return api.put<{ listing: Listing }>(`/listings/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/listings/${id}`);
  },
};
