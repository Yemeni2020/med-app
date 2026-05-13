import { useContext } from 'react';
import { UserTourContext } from '@/components/tour/UserTourProvider';

export function useUserTour() {
  const context = useContext(UserTourContext);

  if (!context) {
    throw new Error('useUserTour must be used within a UserTourProvider');
  }

  return context;
}
