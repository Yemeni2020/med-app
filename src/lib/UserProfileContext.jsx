import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ApiError, getProfile, updateProfile as saveProfile, uploadProfileAvatar } from '@/lib/med-api';
import { useAuth } from '@/lib/AuthContext';

const UserProfileContext = createContext(null);

export function UserProfileProvider({ children }) {
  const { isAuthenticated, authChecked } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!authChecked) {
      return;
    }

    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const me = await getProfile();
      setProfile(me);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        throw error;
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [authChecked, isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data) => {
    const updated = await saveProfile(data);
    setProfile(updated);
    return updated;
  };

  const uploadAvatar = async (file) => {
    const { avatar_url } = await uploadProfileAvatar(file);
    setProfile((previous) => previous ? { ...previous, avatar_url } : previous);
    return avatar_url;
  };

  return (
    <UserProfileContext.Provider value={{ profile, loading, updateProfile, uploadAvatar, fetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
}
