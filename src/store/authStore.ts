import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Admin, User } from '../types';

interface AuthState {
  user: Admin | User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string, isAdminLogin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize auth state
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (!session) {
      set({ user: null, isAdmin: false, loading: false, initialized: true });
      return;
    }

    try {
      // Check if admin
      const { data: adminData } = await supabase
        .from('admins')
        .select()
        .eq('email', session.user.email)
        .single();

      if (adminData) {
        set({ user: adminData, isAdmin: true, loading: false, initialized: true });
        return;
      }

      // Check if regular user
      const { data: userData } = await supabase
        .from('users')
        .select()
        .eq('email', session.user.email)
        .single();

      if (userData) {
        set({ user: userData, isAdmin: false, loading: false, initialized: true });
        return;
      }

      set({ user: null, isAdmin: false, loading: false, initialized: true });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
        initialized: true
      });
    }
  });

  return {
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
    initialized: false,

    signIn: async (email: string, password: string, isAdminLogin = false) => {
      set({ loading: true, error: null });
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) throw authError;

        // Auth state change listener will handle the rest
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Invalid credentials',
          loading: false
        });
        throw error;
      }
    },

    signOut: async () => {
      set({ loading: true, error: null });
      try {
        await supabase.auth.signOut();
        set({ user: null, isAdmin: false, loading: false, error: null });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'An error occurred',
          loading: false
        });
        throw error;
      }
    },
  };
});