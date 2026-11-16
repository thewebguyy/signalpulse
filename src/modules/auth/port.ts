import type { Session } from "@/contracts/session";

/** Future trusted adapter validates cookies/revocation. No implementation is provided. */
export interface AuthenticationPort { readSession(): Promise<Session> }
