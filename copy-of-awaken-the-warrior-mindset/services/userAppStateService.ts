import { supabase } from './supabase';
import { UserData } from '../types';

/**
 * Stage 1.2 Phase A — Cloud sync service for `user_app_state`.
 *
 * This is a standalone, side-effect-free service layer. It is intentionally
 * NOT wired into App.tsx yet. localStorage remains the primary store during
 * this phase; Supabase sync runs in parallel and must never break the UI.
 *
 * All functions fail safely: they log warnings/errors and return safe values
 * instead of throwing, so a network/Supabase failure can never crash the app.
 */

// Keys must match the existing localStorage keys used in App.tsx.
const STORAGE_KEY = 'warrior_mindset_data_v3';
const ONBOARDING_KEY = 'onboardingComplete';

const TABLE = 'user_app_state';
const SCHEMA_VERSION = 1;

/** Shape of a row in public.user_app_state. */
export interface UserAppStateRow {
  id: string;
  user_id: string;
  app_data: UserData;
  schema_version: number;
  created_at: string;
  updated_at: string;
}

/**
 * A. Load the authenticated user's app state from the cloud.
 *
 * Returns `null` ONLY when there is genuinely no row for this user (expected
 * for first-time / pre-migration users). On a real Supabase/network failure it
 * THROWS, so callers can distinguish "no data yet" (safe to migrate) from
 * "load failed" (must fall back to localStorage and NOT migrate). Callers wrap
 * this in try/catch, so no throw ever reaches the UI.
 *
 * @returns the parsed `app_data` blob, or `null` if no row exists.
 * @throws on a Supabase error or unexpected/network failure.
 */
export async function loadUserAppState(userId: string): Promise<UserData | null> {
  if (!userId) {
    console.warn('[userAppStateService] loadUserAppState called without a userId.');
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('app_data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[userAppStateService] loadUserAppState failed:', error.message);
    throw error;
  }

  if (!data) {
    // No row yet for this user — expected for first-time / pre-migration users.
    console.log('[userAppStateService] No cloud row found for user.');
    return null;
  }

  return (data.app_data as UserData) ?? null;
}

/**
 * B. Save (upsert) the full app state blob for a user.
 *
 * Upserts on the unique `user_id` constraint, so there is always exactly one
 * row per user. `updated_at` is refreshed automatically by the DB trigger.
 *
 * @returns `true` on success, `false` on failure (never throws to the UI).
 */
export async function saveUserAppState(userId: string, appData: UserData): Promise<boolean> {
  if (!userId) {
    console.warn('[userAppStateService] saveUserAppState called without a userId.');
    return false;
  }

  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        {
          user_id: userId,
          app_data: appData,
          schema_version: SCHEMA_VERSION,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.warn('[userAppStateService] saveUserAppState failed:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[userAppStateService] saveUserAppState unexpected error:', err);
    return false;
  }
}

/**
 * C. One-time migration of the existing localStorage blob into the cloud.
 *
 * - Reads `warrior_mindset_data_v3` from localStorage.
 * - If the user has NO cloud row yet, uploads the local blob.
 * - If a cloud row already exists, does nothing (cloud is source of truth).
 * - Fails safely: only console warnings, never throws.
 *
 * @returns `true` if a migration upload happened, otherwise `false`.
 */
export async function migrateLocalStorageToCloud(userId: string): Promise<boolean> {
  if (!userId) {
    console.warn('[userAppStateService] migrateLocalStorageToCloud called without a userId.');
    return false;
  }

  try {
    // 1. Does a cloud row already exist? If so, do nothing.
    const existing = await loadUserAppState(userId);
    if (existing !== null) {
      console.log('[userAppStateService] Cloud row already exists — skipping migration.');
      return false;
    }

    // 2. Read the local blob.
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log('[userAppStateService] No local data to migrate.');
      return false;
    }

    let parsed: UserData;
    try {
      parsed = JSON.parse(raw) as UserData;
    } catch (parseErr) {
      console.warn('[userAppStateService] Local data is not valid JSON — skipping migration:', parseErr);
      return false;
    }

    // 3. Upload it.
    const ok = await saveUserAppState(userId, parsed);
    if (ok) {
      console.log('[userAppStateService] Migrated local data to cloud.');
    } else {
      console.warn('[userAppStateService] Migration upload failed — local data preserved.');
    }
    return ok;
  } catch (err) {
    console.warn('[userAppStateService] migrateLocalStorageToCloud unexpected error:', err);
    return false;
  }
}

/**
 * D. Clear local user data. Intended for logout cleanup in a later phase.
 *
 * Removes the app-state blob and the onboarding flag from localStorage.
 * Does not touch the Supabase auth session (handled by supabase.auth.signOut).
 */
export function clearLocalUserData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    console.log('[userAppStateService] Cleared local user data.');
  } catch (err) {
    console.warn('[userAppStateService] clearLocalUserData unexpected error:', err);
  }
}
