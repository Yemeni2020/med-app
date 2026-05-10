import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiError, clearAccessToken, getAccessToken, getCurrentUser, getMedSetting, getProfile, login as loginRequest, logout as logoutRequest, registerPatient, updateProfile as updateProfileRequest } from '@/lib/med-api';

const AuthContext = createContext(null);

function getLocalizedValue(value, lang, fallback = '') {
  if (!value || typeof value !== 'object') {
    return value ?? fallback;
  }

  return value[lang] ?? value.en ?? value.ar ?? fallback;
}

function mapPublicSettings(payload) {
  const value = payload?.value || {};

  return {
    raw: value,
    hero: value.hero || {},
    newsletter: value.newsletter || {},
    footer: value.footer || {},
    healthTools: value.healthTools || {},
    resolve(entry, lang, fallback = '') {
      return getLocalizedValue(entry, lang, fallback);
    },
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const settings = await getMedSetting('med_app_public');
        if (active) {
          setAppPublicSettings(mapPublicSettings(settings));
        }
      } catch {
        if (active) {
          setAppPublicSettings(null);
        }
      } finally {
        if (active) {
          setIsLoadingPublicSettings(false);
        }
      }

      const token = getAccessToken();
      if (!token) {
        if (active) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (active) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setAuthError(null);
        }
      } catch (error) {
        if (active) {
          if (error instanceof ApiError && error.status === 401) {
            clearAccessToken();
          }
          setUser(null);
          setIsAuthenticated(false);
          setAuthError(error);
        }
      } finally {
        if (active) {
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setIsAuthenticated(true);
    setAuthError(null);
    setAuthChecked(true);
    return currentUser;
  };

  const login = async (credentials) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const payload = await loginRequest(credentials);
      setUser(payload.user);
      setIsAuthenticated(true);
      setAuthChecked(true);
      return payload.user;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(error);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const register = async (payload) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const response = await registerPatient(payload);
      setUser(response.user);
      setIsAuthenticated(true);
      setAuthChecked(true);
      return response.user;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(error);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    setIsLoadingAuth(true);

    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  };

  const updateProfile = async (payload) => {
    const profile = await updateProfileRequest(payload);
    setUser(profile);
    return profile;
  };

  const loadProfile = async () => {
    const profile = await getProfile();
    setUser(profile);
    return profile;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authChecked,
      appPublicSettings,
      login,
      register,
      logout,
      refreshUser,
      loadProfile,
      updateProfile,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
