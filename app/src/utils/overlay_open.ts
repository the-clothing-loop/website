// uses binary math to calculate which state is currently active
export enum OverlayState {
  OPEN_ALL = 0,
  CLOSE_CHAIN_APP_DISABLED = 1,
  CLOSE_PAUSED = 2,
  CLOSE_ALL = 4,
}

export function OverlayContainsState(e: OverlayState, contains: OverlayState) {
  return ((e as number) & (contains as number)) !== 0;
}
