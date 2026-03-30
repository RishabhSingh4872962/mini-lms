import { useCallback, useRef, useState } from "react";

interface UseRetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  onSuccess?: () => void;
  onFailure?: (error: unknown) => void;
}

interface UseRetryReturn {
  attempt: (fn: () => Promise<void>) => Promise<void>;
  isRetrying: boolean;
  attemptCount: number;
  lastError: string | null;
  reset: () => void;
}

function extractMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "Something went wrong.";
  if ("response" in error) {
    const res = (error as { response?: { data?: { message?: string } } })
      .response;
    if (res?.data?.message) return res.data.message;
  }
  if ("message" in error) return String((error as { message: string }).message);
  return "Something went wrong.";
}

export function useRetry({
  maxAttempts = 3,
  baseDelayMs = 800,
  onSuccess,
  onFailure,
}: UseRetryOptions = {}): UseRetryReturn {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttemptCount(0);
    setLastError(null);
    abortRef.current = false;
  }, []);

  const attempt = useCallback(
    async (fn: () => Promise<void>) => {
      abortRef.current = false;
      setIsRetrying(true);
      setLastError(null);

      for (let i = 1; i <= maxAttempts; i++) {
        if (abortRef.current) break;

        setAttemptCount(i);

        try {
          await fn();
          setIsRetrying(false);
          setLastError(null);
          onSuccess?.();
          return;
        } catch (error) {
          const msg = extractMessage(error);
          setLastError(msg);

          if (i < maxAttempts) {
            // Exponential backoff
            const delay = baseDelayMs * Math.pow(2, i - 1);
            await new Promise((res) => setTimeout(res, delay));
          } else {
            onFailure?.(error);
          }
        }
      }

      setIsRetrying(false);
    },
    [maxAttempts, baseDelayMs, onSuccess, onFailure],
  );

  return { attempt, isRetrying, attemptCount, lastError, reset };
}
