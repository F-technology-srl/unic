export function fetcher(
  refreshToken: () => Promise<boolean>,
  authorizationToken?: string,
) {
  async function fetchUtilFunction(
    input: RequestInfo,
    init?: RequestInit,
  ): Promise<Response> {
    const headers = new Headers(init?.headers);
    if (authorizationToken) {
      headers.set('authorization', `Bearer ${authorizationToken}`);
    }
    const response = await fetch(input, {
      ...init,
      headers,
    });

    if (!response.ok) {
      // Authentication errors
      if (response.status === 401 || response.status === 407) {
        // Try to refresh the token
        if (await refreshToken()) {
          return fetchUtilFunction(input, init);
        }
      }
    }
    return response;
  }

  return fetchUtilFunction;
}

export function jsonFetcher(
  refreshToken: () => Promise<boolean>,
  authorizationToken?: string,
) {
  return async <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResponseBodyType = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ReponseErrorType = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RequestBody = any,
  >(
    input: RequestInfo,
    init?: Omit<RequestInit, 'body'> & { body?: RequestBody },
  ): Promise<ResponseBodyType | ReponseErrorType> => {
    const headers = new Headers(init?.headers);
    headers.set('content-type', 'application/json');

    const body = init?.body ? JSON.stringify(init?.body) : undefined;

    return fetcher(refreshToken, authorizationToken)(input, {
      ...init,
      headers,
      body,
    }).then((res) => res.json());
  };
}
