/// <reference types="jest" />

export const mockFetch = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.fetch = mockFetch as any;

export default mockFetch;
