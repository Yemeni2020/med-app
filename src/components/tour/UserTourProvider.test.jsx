import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/lib/LanguageContext';
import { UserTourProvider } from '@/components/tour/UserTourProvider';
import TourButton from '@/components/tour/TourButton';

const mockUseAuth = vi.fn();
const driverFactory = vi.fn();
const driverInstance = {
  drive: vi.fn(),
  destroy: vi.fn(),
};

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('driver.js', () => ({
  driver: (config) => {
    driverFactory(config);
    return driverInstance;
  },
}));

function renderTourTree({ route = '/', lang = 'en', user = null, children = null } = {}) {
  window.localStorage.clear();
  window.localStorage.setItem('lang', lang);
  mockUseAuth.mockReturnValue({
    user,
    authChecked: true,
    isLoadingAuth: false,
  });

  return render(
    <MemoryRouter initialEntries={[route]}>
      <LanguageProvider>
        <UserTourProvider>
          {children}
        </UserTourProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
}

async function advance(ms) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}

describe('UserTourProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    driverFactory.mockClear();
    driverInstance.drive.mockClear();
    driverInstance.destroy.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('auto-starts the guest tour for visitors', async () => {
    renderTourTree({
      route: '/',
      children: <div data-tour="navbar-logo">Logo</div>,
    });

    await advance(1100);

    expect(driverFactory).toHaveBeenCalled();
    expect(driverFactory.mock.calls.at(-1)[0].steps[0].popover.title).toBe('Welcome to the Medical Platform');
  });

  it('does not auto-start a completed tour again', async () => {
    window.localStorage.setItem('med_tour_guest_completed', 'true');

    mockUseAuth.mockReturnValue({
      user: null,
      authChecked: true,
      isLoadingAuth: false,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <UserTourProvider>
            <div data-tour="navbar-logo">Logo</div>
          </UserTourProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    await advance(1200);

    expect(driverFactory).not.toHaveBeenCalled();
  });

  it('allows the user to restart the tour manually', async () => {
    window.localStorage.setItem('med_tour_guest_completed', 'true');

    mockUseAuth.mockReturnValue({
      user: null,
      authChecked: true,
      isLoadingAuth: false,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <UserTourProvider>
            <div data-tour="navbar-logo">Logo</div>
            <TourButton />
          </UserTourProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    driverFactory.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Start Tour' }));
    await advance(50);

    expect(driverFactory).toHaveBeenCalled();
    expect(driverFactory.mock.calls.at(-1)[0].steps[0].popover.title).toBe('Welcome to the Medical Platform');
  });

  it('renders Arabic tour copy correctly', async () => {
    renderTourTree({
      route: '/',
      lang: 'ar',
      children: <div data-tour="navbar-logo">Logo</div>,
    });

    await advance(1100);

    expect(driverFactory).toHaveBeenCalledTimes(1);
    expect(driverFactory.mock.calls[0][0].steps[0].popover.title).toBe('مرحبًا بك في المنصة الطبية');
  });

  it('skips a missing target without crashing the app', async () => {
    renderTourTree({
      route: '/articles',
      children: <div>No tour target here</div>,
    });

    await advance(6000);

    expect(driverFactory).not.toHaveBeenCalled();
  });

  it('selects the doctor tour for doctor users', async () => {
    renderTourTree({
      route: '/doctor-dashboard',
      user: { role: 'doctor' },
      children: <div data-tour="doctor-dashboard">Doctor</div>,
    });

    await advance(1100);

    expect(driverFactory.mock.calls[0][0].steps[0].popover.title).toBe('Welcome to your doctor dashboard');
  });

  it('selects the admin tour for managers and admins', async () => {
    renderTourTree({
      route: '/admin/reviews',
      user: { role: 'manager' },
      children: <div data-tour="admin-reviews">Admin</div>,
    });

    await advance(1100);

    expect(driverFactory.mock.calls[0][0].steps[0].popover.title).toBe('Review pending user reviews');
  });
});
