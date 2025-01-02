import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import type { Admin, User } from '../types';

interface AuthState {
  user: Admin | User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string, isAdminLogin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: false,
  loading: false, // Start with loading false
  error: null,
  initialized: false,

  initialize: async () => {
    // Return early if already initialized or loading
    if (get().initialized || get().loading) {
      return;
    }

    set({ loading: true, error: null });
    
    try {
      console.log('Checking current session...');
      const authUser = await getCurrentUser();
      
      set({ 
        user: authUser?.user || null,
        isAdmin: authUser?.isAdmin || false,
        loading: false,
        initialized: true,
        error: null
      });
      
      console.log('Auth initialized successfully');
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({ 
        user: null,
        isAdmin: false,
        loading: false,
        initialized: true,
        error: error instanceof Error ? error.message : 'Failed to initialize auth'
      });
    }
  },

  signIn: async (email: string, password: string, isAdminLogin = false) => {
    set({ loading: true, error: null });
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      const authUser = await getCurrentUser();
      if (!authUser) {
        throw new Error('Failed to get user data');
      }

      if (isAdminLogin && !authUser.isAdmin) {
        throw new Error('Not authorized as admin');
      }

      set({ 
        user: authUser.user,
        isAdmin: authUser.isAdmin,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Sign in error:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Invalid credentials'
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await supabase.auth.signOut();
      set({ 
        user: null,
        isAdmin: false,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Sign out error:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sign out'
      });
      throw error;
    }
  }
}));