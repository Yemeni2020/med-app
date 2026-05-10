import React from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile } from '@/lib/UserProfileContext';

export default function UserAvatar({ size = 'sm', linkTo = '/profile', showName = false }) {
  const { profile } = useUserProfile();
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  const avatar = (
    <div className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 ring-2 ring-primary/20 hover:ring-primary/50 transition-all`}>
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-white">{initials}</span>
      )}
    </div>
  );

  if (!linkTo) {
    return showName ? (
      <div className="flex items-center gap-2">
        {avatar}
        <span className="text-sm font-medium">{profile?.full_name}</span>
      </div>
    ) : avatar;
  }

  return (
    <Link to={linkTo} className="flex items-center gap-2">
      {avatar}
      {showName ? <span className="text-sm font-medium hidden lg:block">{profile?.full_name}</span> : null}
    </Link>
  );
}
