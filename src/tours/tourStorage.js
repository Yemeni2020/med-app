const TOUR_KEYS = {
  guest: 'med_tour_guest_completed',
  patient: 'med_tour_patient_completed',
  doctor: 'med_tour_doctor_completed',
  admin: 'med_tour_admin_completed',
};

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getTourStorageKey(role) {
  return TOUR_KEYS[role] || TOUR_KEYS.guest;
}

export function isTourCompleted(role) {
  if (!hasWindow()) return false;

  return window.localStorage.getItem(getTourStorageKey(role)) === 'true';
}

export function markTourCompleted(role) {
  if (!hasWindow()) return;
  window.localStorage.setItem(getTourStorageKey(role), 'true');
}

export function resetTourCompletion(role) {
  if (!hasWindow()) return;
  window.localStorage.removeItem(getTourStorageKey(role));
}

export function resetAllTourCompletions() {
  if (!hasWindow()) return;

  Object.values(TOUR_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

export function getAllTourCompletionStates() {
  return {
    guest: isTourCompleted('guest'),
    patient: isTourCompleted('patient'),
    doctor: isTourCompleted('doctor'),
    admin: isTourCompleted('admin'),
  };
}
