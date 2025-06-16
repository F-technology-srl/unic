import { useCallback, useMemo, useState } from 'react';

export interface ErrorLikeResponse {
  error?: string;
  message?: string | Array<string>;
  statusCode?: number;
}

export function useHandleRespError(shouldThrow = true) {
  const [error, setError] = useState<string>();

  const handle = useMemo(
    () =>
      <ResponseTypeBody>(response?: ResponseTypeBody & ErrorLikeResponse) => {
        if (response?.error || response?.statusCode) {
          const errmess = Array.isArray(response.message)
            ? response.message.join(',')
            : response.message;

          if (error !== errmess) {
            setError(errmess);
          }

          if (shouldThrow) {
            throw new Error(errmess);
          } else {
            return undefined;
          }
        }

        return response as ResponseTypeBody;
      },
    [error, shouldThrow],
  );

  const reset = useCallback(() => {
    setError(undefined);
  }, []);

  return {
    handle,
    reset,
    error,
  };
}
