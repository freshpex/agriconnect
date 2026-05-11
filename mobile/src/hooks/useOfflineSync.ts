import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { flushOfflineQueue } from "../utils/offlineQueue";

const OFFLINE_SYNC_TASK = "agriconnect-offline-sync";
const SYNC_INTERVAL_MINUTES = 15;

function refreshSyncedData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["orders"] });
  queryClient.invalidateQueries({ queryKey: ["listings"] });
  queryClient.invalidateQueries({ queryKey: ["myListings"] });
  queryClient.invalidateQueries({ queryKey: ["listing"] });
}

if (!TaskManager.isTaskDefined(OFFLINE_SYNC_TASK)) {
  TaskManager.defineTask(OFFLINE_SYNC_TASK, async () => {
    try {
      await flushOfflineQueue();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

async function registerOfflineSyncTask() {
  if (Platform.OS === "web") return;

  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;

  const registered = await TaskManager.isTaskRegisteredAsync(OFFLINE_SYNC_TASK);
  if (registered) return;

  await BackgroundTask.registerTaskAsync(OFFLINE_SYNC_TASK, {
    minimumInterval: SYNC_INTERVAL_MINUTES,
  });
}

export function useOfflineSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    async function syncQueuedActions() {
      try {
        const result = await flushOfflineQueue();
        if (!cancelled && result.submitted > 0) {
          refreshSyncedData(queryClient);
        }
      } catch {
        // Sync is opportunistic; queued actions remain stored for the next pass.
      }
    }

    registerOfflineSyncTask().catch(() => undefined);
    syncQueuedActions();

    const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected !== false && state.isInternetReachable !== false) {
        syncQueuedActions();
      }
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          syncQueuedActions();
        }
      }
    );

    return () => {
      cancelled = true;
      netInfoUnsubscribe();
      appStateSubscription.remove();
    };
  }, [queryClient]);
}
