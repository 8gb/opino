import SupabaseAuthService from './SupabaseAuthService';

const AUTH_PROVIDER = 'supabase';

const authService = SupabaseAuthService;

export const currentProvider = AUTH_PROVIDER;
export default authService;
