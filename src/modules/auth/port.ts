import type { Session, GuestCreate } from "@/contracts/session";
import type { LinkRecoveryRequest } from "@/contracts/auth";

/**
 * Authentication and session boundary.
 * Manages guest identity, anonymous sessions, recovery linking, and logout.
 */
export interface AuthenticationPort {
  readSession(): Promise<Session>;
  createGuest(request: GuestCreate): Promise<Session>;
  linkRecovery(request: LinkRecoveryRequest): Promise<{ success: boolean; recovery_mode: string }>;
  logout(): Promise<void>;
  deleteAccount?(): Promise<void>;
}
