import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

type AuthState = {
  user: SupabaseUser | null;
  setUser: (user: SupabaseUser | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const initAuthListener = () => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setUser(session?.user ?? null);
  });

  // Cookies are now the single source of truth shared with the server, so no
  // manual sync to /api/callback is needed — just mirror the user into the store
  // so the UI reacts to auth changes.
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setUser(session?.user ?? null);
  });
};
