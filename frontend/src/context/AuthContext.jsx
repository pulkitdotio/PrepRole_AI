import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deleteCurrentAccount, getCurrentUser, loginUser, logoutUser, registerUser } from '../features/auth/auth.api';
import { AuthContext } from './auth-context';
import api from '../services/api';
import { installSessionInterceptor } from '../services/sessionInterceptor';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  // Ignore responses from requests made before a newer login/logout/session failure.
  const sessionVersion = useRef(0);
  const authOperation = useRef(0);

  const clearSession = useCallback(() => {
    sessionVersion.current += 1;
    setUser(null);
    setSessionExpiresAt(null);
  }, []);

  useEffect(() => installSessionInterceptor(api, {
    getVersion: () => sessionVersion.current,
    onUnauthorized: clearSession,
  }), [clearSession]);

  useEffect(() => {
    if (!sessionExpiresAt) return;
    const expiresAt = Date.parse(sessionExpiresAt);
    if (!Number.isFinite(expiresAt)) return;
    const expireIfNeeded = () => {
      if (Date.now() >= expiresAt) clearSession();
    };
    const timer = window.setTimeout(expireIfNeeded, Math.max(0, expiresAt - Date.now()));
    document.addEventListener('visibilitychange', expireIfNeeded);
    window.addEventListener('focus', expireIfNeeded);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', expireIfNeeded);
      window.removeEventListener('focus', expireIfNeeded);
    };
  }, [sessionExpiresAt, clearSession]);

  const loadUser = useCallback(async () => {
    const version = sessionVersion.current;
    try {
      const response = await getCurrentUser();
      if (version === sessionVersion.current) {
        setUser(response.user);
        setSessionExpiresAt(response.sessionExpiresAt);
      }
    } catch {
      if (version === sessionVersion.current) clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    let active = true;
    const version = sessionVersion.current;
    getCurrentUser()
      .then(response => {
        if (active && version === sessionVersion.current) {
          setUser(response.user);
          setSessionExpiresAt(response.sessionExpiresAt);
        }
      })
      .catch(() => {
        if (active && version === sessionVersion.current) clearSession();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [clearSession]);

  const login = useCallback(async credentials => {
    const operation = ++authOperation.current;
    sessionVersion.current += 1;
    const response = await loginUser(credentials);
    // Expiry of an old session must not discard a successful in-flight login.
    if (operation === authOperation.current) {
      sessionVersion.current += 1;
      setUser(response.user);
      setSessionExpiresAt(response.sessionExpiresAt);
    }
    setLoading(false);
    return response;
  }, []);

  const register = useCallback(async userData => {
    const operation = ++authOperation.current;
    sessionVersion.current += 1;
    const response = await registerUser(userData);
    if (operation === authOperation.current) {
      sessionVersion.current += 1;
      setUser(response.user);
      setSessionExpiresAt(response.sessionExpiresAt);
    }
    setLoading(false);
    return response;
  }, []);

  const logout = useCallback(async () => {
    const operation = ++authOperation.current;
    sessionVersion.current += 1;
    try {
      await logoutUser();
    } finally {
      if (operation === authOperation.current) clearSession();
    }
  }, [clearSession]);

  const deleteAccount = useCallback(async password => {
    const operation = ++authOperation.current;
    sessionVersion.current += 1;
    const response = await deleteCurrentAccount(password);
    if (operation === authOperation.current) clearSession();
    return response;
  }, [clearSession]);

  const value = useMemo(() => ({
    user, loading, isAuthenticated: Boolean(user), login, register, logout,
    refreshUser: loadUser, deleteAccount,
  }), [user, loading, login, register, logout, loadUser, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
