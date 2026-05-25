let inFlight = false;

export function tryAcquirePdfParseLock(): boolean {
  if (inFlight) return false;
  inFlight = true;
  return true;
}

export function releasePdfParseLock(): void {
  inFlight = false;
}

export function isPdfParseInFlight(): boolean {
  return inFlight;
}
