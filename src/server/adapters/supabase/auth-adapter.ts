import "server-only";
import type { AuthenticationPort } from "@/modules/auth/port";
import type { Session, GuestCreate } from "@/contracts/session";
import type { LinkRecoveryRequest } from "@/contracts/auth";
import { createSupabaseServerClient } from "./client";
import { createSyntheticFixtures } from "@/fixtures/synthetic";

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

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return {
        state: "signed_out",
        owner_id: null,
        recovery_mode: "none",
        csrf_token: "csrf-" + crypto.randomUUID().slice(0, 8),
      };
    }

    // Check subscriber record to determine recovery mode
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("recovery_mode")
      .eq("id", session.user.id)
      .single();

    const recoveryMode = (subscriber?.recovery_mode as "none" | "email_linked" | "passkey") ?? "none";

    return {
      state: "active_guest",
      owner_id: session.user.id,
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
      // In synthetic mode, return synthetic active guest fixture
      const fixture = createSyntheticFixtures().session;
      return {
        state: "active_guest",
        owner_id: "00000000-0000-4000-8000-000000000001",
        recovery_mode: "none",
        csrf_token: fixture.csrf_token,
      };
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      throw new Error("Failed to initialize private guest session: " + (error?.message ?? "unknown error"));
    }

    // Auto-create or ensure subscriber profile exists
    await supabase.from("subscribers").upsert({
      id: data.user.id,
      status: "active",
      recovery_mode: "none",
      backup_enrolled: true,
      updated_at: new Date().toISOString(),
    });

    return {
      state: "active_guest",
      owner_id: data.user.id,
      recovery_mode: "none",
      csrf_token: "csrf-" + crypto.randomUUID().slice(0, 8),
    };
  }

  async linkRecovery(request: LinkRecoveryRequest): Promise<{ success: boolean; recovery_mode: string }> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { success: true, recovery_mode: "email_linked" };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Active session required to link recovery method.");
    }

    // Update user identity with email for passwordless/OTP recovery
    const { error: updateError } = await supabase.auth.updateUser({
      email: request.email,
    });

    if (updateError) {
      throw new Error("Failed to register recovery email: " + updateError.message);
    }

    // Update subscriber profile
    await supabase
      .from("subscribers")
      .update({
        recovery_mode: "email_linked",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return { success: true, recovery_mode: "email_linked" };
  }

  async logout(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
}
