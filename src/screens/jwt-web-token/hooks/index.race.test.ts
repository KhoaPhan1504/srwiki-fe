import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('~root/screens/jwt-web-token/crypto', () => ({
  buildJwt: vi.fn(),
  verifyJwtSignature: vi.fn().mockResolvedValue({ success: true, valid: true }),
}));

import { buildJwt } from '~root/screens/jwt-web-token/crypto';
import { useJwtWebTokenHooks } from './index';

type BuildJwtSuccess = { success: true; token: string };

describe('useJwtWebTokenHooks — stale async response guard', () => {
  it('ignores a resign response that resolves after a newer resign has already been requested', async () => {
    const resolvers: Array<(value: BuildJwtSuccess) => void> = [];
    vi.mocked(buildJwt).mockImplementation(
      () => new Promise<BuildJwtSuccess>((resolve) => resolvers.push(resolve)),
    );

    const { result } = renderHook(() => useJwtWebTokenHooks());

    act(() => {
      result.current.setPayloadText('{"a":1}');
    });
    act(() => {
      result.current.setPayloadText('{"a":2}');
    });

    expect(resolvers).toHaveLength(2);

    // The newer (second) request settles first, as it normally would.
    await act(async () => {
      resolvers[1]({ success: true, token: 'second.header.sig' });
    });
    expect(result.current.token).toBe('second.header.sig');

    // The stale first request settles late — its result must be discarded.
    await act(async () => {
      resolvers[0]({ success: true, token: 'first.header.sig' });
    });
    expect(result.current.token).toBe('second.header.sig');
  });
});
