
import authService from './index';
import SupabaseAuthService from './SupabaseAuthService';

describe('AuthService Factory', () => {
  it('should export an object', () => {
    expect(authService).toBeDefined();
  });

  it('should default to Supabase', () => {
    expect(authService).toBe(SupabaseAuthService);
  });
});
