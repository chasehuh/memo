export const WRAP_STORAGE_KEY = "agentnote.wrap";
export const DEFAULT_WRAP = true;

export function isWrapPreference(value: string | null): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}
