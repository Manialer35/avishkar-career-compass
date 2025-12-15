import type { AuthUser } from "@/types/auth";

/**
 * Returns a stable user identifier across web + Capacitor Firebase shapes.
 * Order matters: prefer Firebase UID, then localId, then id/email fallback.
 */
export const getAuthUserId = (user?: AuthUser | any): string | null => {
  if (!user) return null;

  return (
    (user as any)?.uid ||
    (user as any)?.localId ||
    (user as any)?.id ||
    (user as any)?.user_id ||
    (user as any)?.email ||
    null
  );
};
