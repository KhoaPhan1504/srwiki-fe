import { describe, expect, it } from 'vitest';
import { getNodeKey, protectedRouteTree } from './routeTree';
import type { RouteType } from './routeTree';

const collectPaths = (tree: RouteType[]): string[] =>
  tree.flatMap((node) => [
    ...(node.path ? [node.path] : []),
    ...(node.children ? collectPaths(node.children) : []),
  ]);

describe('protectedRouteTree', () => {
  it('has no duplicate paths across the whole tree', () => {
    const paths = collectPaths(protectedRouteTree);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('groups the Development tools under nav.sectionDevelopment', () => {
    const devGroup = protectedRouteTree.find((node) => node.title === 'nav.sectionDevelopment');
    expect(devGroup?.children?.map((child) => child.path)).toEqual([
      '/tools/rest-api-client',
      '/tools/curl-generator',
      '/tools/headers-inspector',
    ]);
  });

  it('groups the remaining tools under nav.sectionTools', () => {
    const toolsGroup = protectedRouteTree.find((node) => node.title === 'nav.sectionTools');
    expect(toolsGroup?.children?.map((child) => child.path)).toEqual([
      '/tools/json-formatter',
      '/tools/jwt',
      '/tools/uuid-generator',
      '/tools/regex-tester',
      '/tools/markdown-preview',
      '/tools/base64',
      '/tools/url-encoder-decoder',
      '/tools/timestamp-converter',
      '/tools/color-converter',
      '/tools/unit-converter',
    ]);
  });

  it('keeps Admin Members adminOnly and outside any group', () => {
    const admin = protectedRouteTree.find((node) => node.path === '/admin/members');
    expect(admin?.adminOnly).toBe(true);
    expect(admin?.children).toBeUndefined();
  });
});

describe('getNodeKey', () => {
  it('uses path when present', () => {
    expect(getNodeKey({ title: 'x', path: '/x' })).toBe('/x');
  });

  it('falls back to title when path is absent', () => {
    expect(getNodeKey({ title: 'Group Title' })).toBe('Group Title');
  });
});
