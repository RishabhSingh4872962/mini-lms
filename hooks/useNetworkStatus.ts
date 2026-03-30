import * as Network from "expo-network";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: Network.NetworkStateType;
  isChecking: boolean;
}

const DEFAULT_STATUS: NetworkStatus = {
  isConnected: true,
  isInternetReachable: true,
  type: Network.NetworkStateType.UNKNOWN,
  isChecking: true,
};

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(DEFAULT_STATUS);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const checkNetwork = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type ?? Network.NetworkStateType.UNKNOWN,
        isChecking: false,
      });
    } catch {
      setStatus((prev) => ({ ...prev, isChecking: false }));
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkNetwork();

    // Poll every 5s for network changes
    // (expo-network doesn't have a subscription API on all platforms)
    pollIntervalRef.current = setInterval(checkNetwork, 5000);

    // Also re-check when app comes to foreground
    const appStateSub = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          checkNetwork();
        }
        appStateRef.current = nextState;
      },
    );

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      appStateSub.remove();
    };
  }, [checkNetwork]);

  return { ...status, recheck: checkNetwork };
}
