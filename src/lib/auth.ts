import { supabase } from './supabase';
import type { Admin, User } from '../types';

interface AuthUser {
  user: Admin | User;
  isAdmin: boolean;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return null;
    }
    
    if (!session) {
      console.log('No active session');
      return null;
    }

    const isAdmin = session.user.user_metadata?.is_admin === true;
    console.log('User metadata:', session.user.user_metadata);

    if (isAdmin) {
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (adminError) {
        console.error('Admin data fetch error:', adminError);
        return null;
      }

      if (adminData) {
        return { user: adminData, isAdmin: true };
      }
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('User data fetch error:', userError);
      return null;
    }

    if (userData) {
      return { user: userData, isAdmin: false };
    }

    return null;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}