import { getTourRole } from '@/tours/tourSteps';

describe('tour role selection', () => {
  it('returns guest for visitors', () => {
    expect(getTourRole(null)).toBe('guest');
  });

  it('returns patient for normal authenticated users', () => {
    expect(getTourRole({ role: 'patient' })).toBe('patient');
  });

  it('returns doctor for doctor users', () => {
    expect(getTourRole({ role: 'doctor' })).toBe('doctor');
  });

  it('returns admin for admins and managers', () => {
    expect(getTourRole({ role: 'admin' })).toBe('admin');
    expect(getTourRole({ role: 'manager' })).toBe('admin');
  });
});
