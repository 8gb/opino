
import AuthInterface from './AuthInterface';
import supabase from '../supabase/client';
import MonitoringService from '../monitoring/MonitoringService';

class SupabaseAuthService extends AuthInterface {
  _normalizeUser(user) {
    if (!user) return null;
    return {
      ...user,
      uid: user.id, // Map Supabase id to uid for compatibility
      emailVerified: !!user.email_confirmed_at, // Map email verification
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || '',
      photoURL: user.user_metadata?.avatar_url || '',
    };
  }

  async register(email, password, captchaToken) {
    if (!supabase) throw new Error('Supabase not initialized');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { captchaToken },
      });
      if (error) throw error;
      if (data.user) {
          data.user = this._normalizeUser(data.user);
      }
      MonitoringService.logEvent('register_success', { provider: 'supabase' });
      return data;
    } catch (error) {
      MonitoringService.logError(error, { operation: 'register', provider: 'supabase' });
      throw error;
    }
  }

  async login(email, password, captchaToken) {
    if (!supabase) throw new Error('Supabase not initialized');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      });
      
      if (error) {
        // Attempt migration login if standard login fails
        if (error.message === 'Invalid login credentials' || error.status === 400) {
           try {
             return await this._loginWithMigration(email, password);
           } catch (migrationErr) {
             // If migration fails, throw the original error (or the migration error if preferred)
             // We stick to original error to avoid leaking migration details if not relevant
             throw error; 
           }
        }
        throw error;
      }

      if (data.user) {
          data.user = this._normalizeUser(data.user);
      }
      MonitoringService.logEvent('login_success', { provider: 'supabase' });
      return data;
    } catch (error) {
      MonitoringService.logError(error, { operation: 'login', provider: 'supabase' });
      throw error;
    }
  }

  async _loginWithMigration(email, password) {
    const response = await fetch('/api/auth/verify-migration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Migration login failed');
    }

    const { session, user } = await response.json();

    // Set the session in the Supabase client
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (error) throw error;

    MonitoringService.logEvent('login_migration_success', { provider: 'supabase' });
    
    return {
      user: this._normalizeUser(user),
      session,
    };
  }

  async loginWithProvider(providerName) {
    if (!supabase) throw new Error('Supabase not initialized');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: providerName,
      });
      if (error) throw error;
      // OAuth sign in often redirects, so this might not return user immediately
      MonitoringService.logEvent('login_provider_initiated', { provider: 'supabase', strategy: providerName });
      return data;
    } catch (error) {
      MonitoringService.logError(error, { operation: 'loginWithProvider', provider: 'supabase', strategy: providerName });
      throw error;
    }
  }

  async logout() {
    if (!supabase) throw new Error('Supabase not initialized');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      MonitoringService.logEvent('logout_success', { provider: 'supabase' });
    } catch (error) {
      // If session is missing, we are already logged out.
      if (error.message === 'Auth session missing!' || error.name === 'AuthSessionMissingError') {
         MonitoringService.logEvent('logout_already_done', { provider: 'supabase' });
         return;
      }
      MonitoringService.logError(error, { operation: 'logout', provider: 'supabase' });
      throw error;
    }
  }

  async resetPassword(email, options = {}) {
    if (!supabase) throw new Error('Supabase not initialized');
    const { error } = await supabase.auth.resetPasswordForEmail(email, options);
    if (error) throw error;
  }

  async updatePassword(password) {
    if (!supabase) throw new Error('Supabase not initialized');
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return this._normalizeUser(data.user);
  }

  /**
   * Updates user metadata (raw_user_meta_data)
   * @param {Object} metadata - Key-value pairs to update in user metadata
   * @returns {Promise<Object>} Updated user object
   */
  async updateProfile(metadata) {
    if (!supabase) throw new Error('Supabase not initialized');
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });

      if (error) throw error;

      MonitoringService.logEvent('update_profile_success', { provider: 'supabase' });
      return this._normalizeUser(data.user);
    } catch (error) {
      MonitoringService.logError(error, { operation: 'updateProfile', provider: 'supabase' });
      throw error;
    }
  }

  onAuthStateChanged(callback) {
    if (!supabase) return () => {};
    
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
       callback(this._normalizeUser(session?.user ?? null));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(this._normalizeUser(session?.user ?? null));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }

  getCurrentUser() {
    return null; 
  }
}

export default new SupabaseAuthService();
