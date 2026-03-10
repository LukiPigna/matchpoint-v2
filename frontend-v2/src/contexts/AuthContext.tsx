import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthResponse } from '../types.ts';
import { authApi } from '../services/api/auth.api.ts';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  padelTag: string;
  zone?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'mp_access_token';
const REFRESH_KEY = 'mp_refresh_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) { setLoading(false); return; }
      try {
        const res = await authApi.me();
        setUser(res.data);
      } catch {
        // Token expired — try refresh
        try {
          const refresh = localStorage.getItem(REFRESH_KEY);
          if (!refresh) throw new Error('No refresh token');
          const refreshed = await authApi.refresh(refresh);
          localStorage.setItem(TOKEN_KEY, refreshed.data.tokens.accessToken);
          localStorage.setItem(REFRESH_KEY, refreshed.data.tokens.refreshToken);
          setUser(refreshed.data.user);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_KEY);
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem(TOKEN_KEY, res.data.tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, res.data.tokens.refreshToken);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await authApi.register(data);
    localStorage.setItem(TOKEN_KEY, res.data.tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, res.data.tokens.refreshToken);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { TOKEN_KEY };
