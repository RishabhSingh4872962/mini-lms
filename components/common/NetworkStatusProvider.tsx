import { useNetworkStatus, type NetworkStatus } from "@/hooks/useNetworkStatus";
import React, { createContext, useContext, type ReactNode } from "react";

const NetworkContext = createContext<NetworkStatus & { recheck: () => void }>({
  isConnected: true,
  isInternetReachable: true,
  type: 0,
  isChecking: false,
  recheck: () => {},
});

export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const status = useNetworkStatus();
  return (
    <NetworkContext.Provider value={status}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
