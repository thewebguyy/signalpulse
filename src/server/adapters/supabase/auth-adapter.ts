import "server-only";
import type { AuthenticationPort } from "@/modules/auth/port";
import type { Session, GuestCreate } from "@/contracts/session";
import type { LinkRecoveryRequest } from "@/contracts/auth";
import { createSupabaseServerClient } from "./client";

export class SupabaseAuthAdapter implements AuthenticationPort {
  async readSession(): Promise<Session> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      // In synthetic mode or when unconfigured, return signed_out default
      return {
        state: "signed_out",
        owner_id: null,
        recovery_mode: "none",
        csrf_token: "synthetic-csrf-token",
      };
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return {
        state: "signed_out",
        owner_id: null,
        recovery_mode: "none",
        csrf_token: "csrf-" + crypto.randomUUID().slice(0, 8),
      };
    }

    // Check subscriber record to determine recovery mode
    const { data: subscriber, error: profileError } = await supabase
      .from("subscribers")
      .select("recovery_mode, status")
      .eq("id", user.id)
      .single();
    if (profileError || !subscriber || subscriber.status !== "active") {
      throw new Error("Guest profile unavailable or inactive.");
    }

    const recoveryMode = (subscriber?.recovery_mode as "none" | "email_linked" | "passkey") ?? "none";

    return {
      state: "active_guest",
      owner_id: user.id,
      recovery_mode: recoveryMode,
      csrf_token: "csrf-" + crypto.randomUUID().slice(0, 8),
    };
  }

  async createGuest(request: GuestCreate): Promise<Session> {
    if (!request.accept_guest_limitations) {
      throw new Error("Subscriber must explicitly acknowledge guest storage limitations before cloud backup.");
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      throw new Error("Cloud guest sessions are disabled in synthetic mode.");
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      throw new Error("Failed to initialize private guest session.");
    }

    // The auth trigger provisions the profile; clients cannot set recovery state.
    const { data: profile, error: profileError } = await supabase.from("subscribers")
      .select("id").eq("id", data.user.id).single();
    if (profileError || !profile) throw new Error("Private guest profile could not be confirmed.");

    return {
      state: "active_guest",
      owner_id: data.user.id,
      recovery_mode: "none",
      csrf_token: "csrf-" + crypto.randomUUID().slice(0, 8),
    };
  }

  async linkRecovery(request: LinkRecoveryRequest): Promise<{ success: boolean; recovery_mode: string }> {
    // No confirmed account-link and lost-device recovery flow has been verified.
    // Never send an email and call the account recoverable prematurely.
    void request;
    throw new Error("Recovery linking is not yet available.");
  }

  async logout(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error("Could not revoke guest session.");
    }
  }
}
