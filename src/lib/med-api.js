const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const CLIENT_ID_KEY = 'med-app-client-id';
const ACCESS_TOKEN_KEY = 'med-app-access-token';
const API_PREFIX = '/api/v1';
const MED_API_PREFIX = `${API_PREFIX}/med`;

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function getClientId() {
  const storage = getStorage();
  if (!storage) return 'server-render';

  let value = storage.getItem(CLIENT_ID_KEY);
  if (!value) {
    value = window.crypto?.randomUUID?.() || `client-${Date.now()}`;
    storage.setItem(CLIENT_ID_KEY, value);
  }

  return value;
}

export function getAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) || '';
}

export function setAccessToken(token) {
  const storage = getStorage();
  if (!storage) return;

  if (token) {
    storage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    storage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function clearAccessToken() {
  setAccessToken('');
}

function buildUrl(path) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function request(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    'X-Client-Id': getClientId(),
    'X-App-Locale': typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload?.message || payload?.error || 'Request failed.', response.status, payload);
  }

  return payload;
}

export function medApiRequest(path, options) {
  return request(`${MED_API_PREFIX}${path}`, options);
}

export function apiRequest(path, options) {
  return request(`${API_PREFIX}${path}`, options);
}

export async function login(credentials) {
  const payload = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (payload?.token) {
    setAccessToken(payload.token);
  }

  return payload;
}

export async function registerPatient({
  name,
  fullNameAr = '',
  email,
  password,
  passwordConfirmation,
  phone = '',
  phoneCountryCode = '',
  dateOfBirth = '',
  gender = '',
  location = '',
  nationality = '',
  bio = '',
}) {
  const payload = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({
      name: {
        en: name,
        ar: fullNameAr || name,
      },
      email,
      password,
      password_confirmation: passwordConfirmation,
      role: 'patient',
      phone: phone || null,
      phone_country_code: phoneCountryCode || null,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      location: location || null,
      nationality: nationality || null,
      bio: bio || null,
    }),
  });

  if (payload?.token) {
    setAccessToken(payload.token);
  }

  return payload;
}

export function requestPasswordReset(email) {
  return apiRequest('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function logout() {
  try {
    await apiRequest('/logout', { method: 'POST' });
  } finally {
    clearAccessToken();
  }
}

export function getCurrentUser() {
  return apiRequest('/user');
}

export function getProfile() {
  return medApiRequest('/profile');
}

export function updateProfile(profile) {
  return medApiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

export function updateProfilePassword(payload) {
  return medApiRequest('/profile/password', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function uploadProfileAvatar(file) {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(buildUrl(`${MED_API_PREFIX}/profile/avatar`), {
    method: 'POST',
    headers: {
      'X-Client-Id': getClientId(),
      'X-App-Locale': typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload?.message || payload?.error || 'Upload failed.', response.status, payload);
  }

  return payload;
}

export function getMedSetting(key) {
  return medApiRequest(`/settings/${encodeURIComponent(key)}`);
}

export function getSeoPage(page, params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  const suffix = search.toString() ? `?${search.toString()}` : '';
  return medApiRequest(`/seo/${encodeURIComponent(page)}${suffix}`);
}

export function listGuidelines() {
  return medApiRequest('/guidelines');
}

export async function listArticles(limit = 50) {
  return medApiRequest(`/articles?limit=${limit}`);
}

export async function getArticle(id) {
  return medApiRequest(`/articles/${encodeURIComponent(id)}`);
}

export async function getDoctor(id) {
  return medApiRequest(`/doctors/${encodeURIComponent(id)}`);
}

export async function getPatientStory(id) {
  return medApiRequest(`/patient-stories/${encodeURIComponent(id)}`);
}

export function likeArticle(id) {
  return medApiRequest(`/articles/${encodeURIComponent(id)}/like`, {
    method: 'POST',
  });
}

export function unlikeArticle(id) {
  return medApiRequest(`/articles/${encodeURIComponent(id)}/like`, {
    method: 'DELETE',
  });
}

export function shareArticle(id) {
  return medApiRequest(`/articles/${encodeURIComponent(id)}/share`, {
    method: 'POST',
  });
}

export function listDoctors() {
  return medApiRequest('/doctors');
}

export function listReviews(reviewableType, reviewableId, options = {}) {
  const params = new URLSearchParams();

  if (reviewableType) {
    params.set('reviewable_type', reviewableType);
  }

  if (reviewableId !== undefined && reviewableId !== null && reviewableId !== '') {
    params.set('reviewable_id', String(reviewableId));
  }

  if (options.status) {
    params.set('status', options.status);
  }

  return medApiRequest(`/reviews?${params.toString()}`);
}

export function getReview(reviewId) {
  return medApiRequest(`/reviews/${encodeURIComponent(reviewId)}`);
}

export function createReview(payload) {
  return medApiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateReview(reviewId, payload) {
  return medApiRequest(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteReview(reviewId) {
  return medApiRequest(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'DELETE',
  });
}

export function moderateReview(reviewId, payload) {
  return medApiRequest(`/reviews/${encodeURIComponent(reviewId)}/moderate`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function listReviewModerationQueue(status = 'pending') {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return medApiRequest(`/reviews/moderation${query}`);
}

export function getDoctorRequest() {
  return medApiRequest('/doctor-request');
}

export function submitDoctorRequest(payload) {
  return medApiRequest('/doctor-request', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listDoctorCategories() {
  return medApiRequest('/doctor/categories');
}

export function listDoctorArticles() {
  return medApiRequest('/doctor/articles');
}

export function createDoctorArticle(payload) {
  return medApiRequest('/doctor/articles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listMedicalNews() {
  return medApiRequest('/news');
}

export function listQASessions() {
  return medApiRequest('/qa-sessions');
}

export function listPatientStories() {
  return medApiRequest('/patient-stories');
}

export function createPatientStory(story) {
  return medApiRequest('/patient-stories', {
    method: 'POST',
    body: JSON.stringify(story),
  });
}

export function analyzeSymptoms({ symptoms, answers = {}, lang = 'en' }) {
  return medApiRequest('/symptom-checker/analyze', {
    method: 'POST',
    body: JSON.stringify({ symptoms, answers, lang }),
  });
}

export function listSavedItems() {
  return medApiRequest('/saved-items');
}

export function saveItem(item) {
  return medApiRequest('/saved-items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export function removeSavedItem(itemId) {
  return medApiRequest(`/saved-items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });
}

export function listHealthMetrics() {
  return medApiRequest('/health-metrics');
}

export function createHealthMetric(metric) {
  return medApiRequest('/health-metrics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}

export function deleteHealthMetric(id) {
  return medApiRequest(`/health-metrics/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function listViewHistory() {
  return medApiRequest('/view-history');
}

export function createViewHistory(entry) {
  return medApiRequest('/view-history', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export function deleteViewHistory(id) {
  return medApiRequest(`/view-history/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function clearViewHistory() {
  return medApiRequest('/view-history', {
    method: 'DELETE',
  });
}

export function saveNewsletterSubscription(subscription) {
  return request(`${API_PREFIX}/newsletter/subscribe`, {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
}

export function askMedicalAssistant(payload) {
  return medApiRequest('/medical-assistant', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
