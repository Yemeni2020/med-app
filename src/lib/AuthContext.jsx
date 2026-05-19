import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiError, clearAccessToken, getAccessToken, getCurrentUser, getMedSetting, getProfile, login as loginRequest, logout as logoutRequest, registerPatient, resendAuthOtp as resendAuthOtpRequest, updateProfile as updateProfileRequest, verifyAuthOtp as verifyAuthOtpRequest } from '@/lib/med-api';

const AuthContext = createContext(null);
const OTP_CHALLENGE_KEY = 'med-app-pending-otp-challenge';

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

function getStoredOtpChallenge() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(OTP_CHALLENGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeOtpChallenge(challenge) {
  if (typeof window === 'undefined') {
    return;
  }

  if (challenge) {
    window.sessionStorage.setItem(OTP_CHALLENGE_KEY, JSON.stringify(challenge));
  } else {
    window.sessionStorage.removeItem(OTP_CHALLENGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  const [pendingOtpChallenge, setPendingOtpChallenge] = useState(() => getStoredOtpChallenge());

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
      if (payload?.requires_otp) {
        const challenge = {
          email: payload.email || credentials.email,
          purpose: payload.otp_purpose || 'login',
        };
        setPendingOtpChallenge(challenge);
        storeOtpChallenge(challenge);
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
        return { requiresOtp: true, ...challenge };
      }

      setPendingOtpChallenge(null);
      storeOtpChallenge(null);
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
      if (response?.requires_otp) {
        const challenge = {
          email: response.email || payload.email,
          purpose: response.otp_purpose || 'register',
        };
        setPendingOtpChallenge(challenge);
        storeOtpChallenge(challenge);
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
        return { requiresOtp: true, ...challenge };
      }

      setPendingOtpChallenge(null);
      storeOtpChallenge(null);
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
      setPendingOtpChallenge(null);
      storeOtpChallenge(null);
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

  const verifyOtpChallenge = async (code) => {
    if (!pendingOtpChallenge) {
      throw new Error('No pending OTP challenge.');
    }

    const response = await verifyAuthOtpRequest({
      email: pendingOtpChallenge.email,
      purpose: pendingOtpChallenge.purpose,
      code,
    });

    setPendingOtpChallenge(null);
    storeOtpChallenge(null);
    setUser(response.user);
    setIsAuthenticated(true);
    setAuthError(null);
    setAuthChecked(true);

    return response.user;
  };

  const resendOtpChallenge = async () => {
    if (!pendingOtpChallenge) {
      throw new Error('No pending OTP challenge.');
    }

    return resendAuthOtpRequest(pendingOtpChallenge);
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
      pendingOtpChallenge,
      login,
      register,
      logout,
      refreshUser,
      loadProfile,
      updateProfile,
      verifyOtpChallenge,
      resendOtpChallenge,
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
