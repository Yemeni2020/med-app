import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TourButton from '@/components/tour/TourButton';
import { UserTourContext } from '@/components/tour/UserTourProvider';
import { LanguageProvider } from '@/lib/LanguageContext';

describe('TourButton', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders correctly and starts the current tour', () => {
    const startTour = vi.fn();

    render(
      <LanguageProvider>
        <UserTourContext.Provider value={{ startTour, currentRole: 'guest', isRunning: false }}>
          <TourButton />
        </UserTourContext.Provider>
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: 'Start Tour' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start Tour' }));

    expect(startTour).toHaveBeenCalledWith('guest', { force: true });
  });
});
