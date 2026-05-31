type PremiumGateHandlers = {
  canMutate: () => boolean;
  onBlocked: () => void;
};

const defaultHandlers: PremiumGateHandlers = {
  canMutate: () => true,
  onBlocked: () => {},
};

let handlers: PremiumGateHandlers = defaultHandlers;
let pendingMutation: (() => void) | null = null;

export function registerPremiumGate(next: PremiumGateHandlers) {
  handlers = next;
}

export function resetPremiumGate() {
  handlers = defaultHandlers;
  pendingMutation = null;
}

export function canMutatePremiumContent(): boolean {
  return handlers.canMutate();
}

export function tryMutatePremiumContent(): boolean {
  if (handlers.canMutate()) return true;
  handlers.onBlocked();
  return false;
}

export function runPremiumMutation<T>(mutation: () => T): T | null {
  if (handlers.canMutate()) return mutation();
  pendingMutation = mutation as () => void;
  handlers.onBlocked();
  return null;
}

export function runPremiumMutationVoid(mutation: () => void): void {
  if (handlers.canMutate()) {
    mutation();
    return;
  }
  pendingMutation = mutation;
  handlers.onBlocked();
}

export function consumePendingPremiumMutation(): (() => void) | null {
  const pending = pendingMutation;
  pendingMutation = null;
  return pending;
}
