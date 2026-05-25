const STACK_TAB_ROOTS = new Set(['routines', 'products', 'profile']);

export function shouldHideTabBar(segments: string[]): boolean {
  const path = segments.filter((segment) => !segment.startsWith('('));

  if (path.length === 0) {
    return false;
  }

  const [root, ...rest] = path;

  if (root === 'index' || root === 'calendar') {
    return false;
  }

  if (!STACK_TAB_ROOTS.has(root)) {
    return false;
  }

  if (rest.length === 0) {
    return false;
  }

  return !(rest.length === 1 && rest[0] === 'index');
}
