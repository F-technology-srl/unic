import { useCallback, useMemo } from 'react';

export function useAggregateError(
  status: 'danger' | 'success' | 'warning',
  ...errors: Array<string | undefined | null>
) {
  const error = useMemo(() => {
    const filteredError = errors?.filter((item) => item);
    if (filteredError.length > 0) {
      return filteredError.join(',');
    }
    return undefined;
  }, [errors]);

  return error
    ? {
        label: error,
        status,
      }
    : undefined;
}

export function useAggregateResets(...callbacks: Array<() => unknown>) {
  return useCallback(() => {
    callbacks.forEach((cb) => cb());
  }, [callbacks]);
}
