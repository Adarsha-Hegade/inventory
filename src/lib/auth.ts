import { supabase } from './supabase';
import type { Admin, User } from '../types';

interface AuthUser {
  user: Admin | User;
  isAdmin: boolean;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }

  // Check if user is admin
  const { data: adminData } = await supabase
    .from('admins')
    .select()
    .eq('email', session.user.email)
    .single();

  if (adminData) {
    return { user: adminData, isAdmin: true };
  }

  // Check if user is regular user
  const { data: userData } = await supabase
    .from('users')
    .select()
    .eq('email', session.user.email)
    .single();

  if (userData) {
    return { user: userData, isAdmin: false };
  }

  return null;
}

export async function signIn(email: string, password: string, isAdminLogin = false): Promise<AuthUser> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) throw authError;

  if (isAdminLogin) {
    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select()
      .eq('email', email)
      .single();

    if (!adminData) {
      throw new Error('Not authorized as admin');
    }

    return { user: adminData, isAdmin: true };
  }

  // Check if user is regular user
  const { data: userData } = await supabase
    .from('users')
    .select()
    .eq('email', email)
    .single();

  if (!userData) {
    throw new Error('User not found');
  }

  return { user: userData, isAdmin: false };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}