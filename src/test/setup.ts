import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement ResizeObserver, which several Radix UI primitives
// (Checkbox, Select, ...) call internally — without this, any test that
// renders them throws "ResizeObserver is not defined".
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

afterEach(() => {
  cleanup();
});
