
import SupabaseAuthService from './SupabaseAuthService';
import supabase from '../supabase/client';

jest.mock('../supabase/client', () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    updateUser: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
  },
}));

describe('SupabaseAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call signUp on register', async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { user: { id: '123', email: 'test@test.com' } }, error: null });
    
    const user = await SupabaseAuthService.register('test@test.com', 'password');
    
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password',
    });
    expect(user.user.uid).toBe('123');
  });

  it('should call signInWithPassword on login', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    
    await SupabaseAuthService.login('test@test.com', 'password');
    
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password',
    });
  });

  it('should call signOut on logout', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });
    
    await SupabaseAuthService.logout();
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should not throw on logout if session is missing', async () => {
    supabase.auth.signOut.mockResolvedValue({ 
      error: { message: 'Auth session missing!', name: 'AuthSessionMissingError' } 
    });
    
    await SupabaseAuthService.logout();
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should call updateUser on updateProfile', async () => {
    supabase.auth.updateUser.mockResolvedValue({ data: { user: { id: '123', user_metadata: { hello: 'world' } } }, error: null });

    await SupabaseAuthService.updateProfile({ hello: 'world' });

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { hello: 'world' },
    });
  });
});
