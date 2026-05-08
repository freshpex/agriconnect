import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { listingsApi, type CreateListingInput } from "../api/listings";
import { ordersApi, type CreateOrderInput } from "../api/orders";
import { storage } from "./storage";

const OFFLINE_QUEUE_KEY = "agriconnect:offline-action-queue";

type OfflineActionBase = {
  id: string;
  userId?: string;
  createdAt: string;
  attempts: number;
  lastError?: string;
};

export type OfflineAction =
  | (OfflineActionBase & {
      type: "create-listing";
      payload: CreateListingInput;
    })
  | (OfflineActionBase & {
      type: "create-order";
      payload: CreateOrderInput;
    });

export type OfflineQueueResult = {
  queuedOffline: true;
  action: OfflineAction;
};

export type OfflineFlushResult = {
  submitted: number;
  failed: number;
  remaining: number;
};

type OfflineQueueListener = (queue: OfflineAction[]) => void;

const listeners = new Set<OfflineQueueListener>();
let activeFlush: Promise<OfflineFlushResult> | null = null;

function createRequestId(type: OfflineAction["type"]) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOfflineAction(value: unknown): value is OfflineAction {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.type === "create-listing" || value.type === "create-order") &&
    isObject(value.payload)
  );
}

function describeError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message;
    return message || "Unable to sync queued action";
  }

  if (error instanceof Error) return error.message;
  return "Unable to sync queued action";
}

export function isRetryableNetworkError(error: unknown) {
  if (!axios.isAxiosError(error)) return false;

  if (!error.response) return true;

  const status = error.response.status;
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export function isOfflineQueueResult(
  result: unknown
): result is OfflineQueueResult {
  return isObject(result) && result.queuedOffline === true;
}

export async function hasUsableConnection() {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected !== false && state.isInternetReachable !== false;
  } catch {
    return true;
  }
}

export async function getOfflineQueue(): Promise<OfflineAction[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isOfflineAction) : [];
  } catch {
    return [];
  }
}

async function saveOfflineQueue(queue: OfflineAction[]) {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  listeners.forEach((listener) => listener(queue));
}

export function subscribeOfflineQueue(listener: OfflineQueueListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function getStoredUserId() {
  const storedUser = await storage.getUser();
  if (!storedUser) return undefined;

  try {
    const user = JSON.parse(storedUser) as { id?: string; _id?: string };
    return user.id || user._id;
  } catch {
    return undefined;
  }
}

async function enqueueAction(
  action: OfflineAction
): Promise<OfflineQueueResult> {
  const queue = await getOfflineQueue();
  const existing = queue.find((item) => item.id === action.id);
  if (existing) {
    return { queuedOffline: true, action: existing };
  }

  await saveOfflineQueue([...queue, action]);
  return { queuedOffline: true, action };
}

export async function queueCreateListing(
  data: CreateListingInput
): Promise<OfflineQueueResult> {
  const id = data.clientRequestId || createRequestId("create-listing");
  const userId = await getStoredUserId();

  return enqueueAction({
    id,
    type: "create-listing",
    userId,
    payload: { ...data, clientRequestId: id },
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
}

export async function queueCreateOrder(
  data: CreateOrderInput
): Promise<OfflineQueueResult> {
  const id = data.clientRequestId || createRequestId("create-order");
  const userId = await getStoredUserId();

  return enqueueAction({
    id,
    type: "create-order",
    userId,
    payload: { ...data, clientRequestId: id },
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
}

export async function createListingWithOfflineQueue(data: CreateListingInput) {
  const payload = {
    ...data,
    clientRequestId: data.clientRequestId || createRequestId("create-listing"),
  };

  if (!(await hasUsableConnection())) {
    return queueCreateListing(payload);
  }

  try {
    return await listingsApi.create(payload);
  } catch (error) {
    if (isRetryableNetworkError(error)) {
      return queueCreateListing(payload);
    }
    throw error;
  }
}

export async function createOrderWithOfflineQueue(data: CreateOrderInput) {
  const payload = {
    ...data,
    clientRequestId: data.clientRequestId || createRequestId("create-order"),
  };

  if (!(await hasUsableConnection())) {
    return queueCreateOrder(payload);
  }

  try {
    return await ordersApi.create(payload);
  } catch (error) {
    if (isRetryableNetworkError(error)) {
      return queueCreateOrder(payload);
    }
    throw error;
  }
}

async function submitAction(action: OfflineAction) {
  if (action.type === "create-listing") {
    await listingsApi.create(action.payload);
    return;
  }

  await ordersApi.create(action.payload);
}

async function flushQueueNow(): Promise<OfflineFlushResult> {
  const queue = await getOfflineQueue();
  if (queue.length === 0) {
    return { submitted: 0, failed: 0, remaining: 0 };
  }

  const [token, currentUserId, online] = await Promise.all([
    storage.getToken(),
    getStoredUserId(),
    hasUsableConnection(),
  ]);

  if (!token || !currentUserId || !online) {
    return { submitted: 0, failed: 0, remaining: queue.length };
  }

  const remaining: OfflineAction[] = [];
  let submitted = 0;
  let failed = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const action = queue[index];

    if (action.userId && action.userId !== currentUserId) {
      remaining.push(action);
      continue;
    }

    try {
      await submitAction(action);
      submitted += 1;
    } catch (error) {
      failed += 1;

      const updatedAction = {
        ...action,
        attempts: action.attempts + 1,
        lastError: describeError(error),
      };

      if (isRetryableNetworkError(error)) {
        remaining.push(updatedAction, ...queue.slice(index + 1));
        break;
      }
    }
  }

  await saveOfflineQueue(remaining);
  return { submitted, failed, remaining: remaining.length };
}

export function flushOfflineQueue() {
  if (!activeFlush) {
    activeFlush = flushQueueNow().finally(() => {
      activeFlush = null;
    });
  }

  return activeFlush;
}
