const storage = typeof window === 'undefined' ? null : window.localStorage;

const read = (key, fallback = []) => {
  if (!storage) return fallback;

  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
};

const createId = () => `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function listSavedItems() {
  return read('savedArticles');
}

export function saveItem(item) {
  const items = listSavedItems();
  const existing = items.find((saved) => saved.item_id === item.item_id);

  if (existing) return existing;

  const created = {
    id: createId(),
    created_date: new Date().toISOString(),
    ...item,
  };

  write('savedArticles', [...items, created]);
  return created;
}

export function removeSavedItem(itemId) {
  const items = listSavedItems().filter((saved) => saved.item_id !== itemId);
  write('savedArticles', items);
}

export function listHealthMetrics() {
  return read('healthMetrics');
}

export function createHealthMetric(metric) {
  const created = {
    id: createId(),
    created_date: new Date().toISOString(),
    ...metric,
  };

  write('healthMetrics', [...listHealthMetrics(), created]);
  return created;
}

export function deleteHealthMetric(id) {
  write('healthMetrics', listHealthMetrics().filter((metric) => metric.id !== id));
}

export function listSubmittedStories() {
  return read('patientStories');
}

export function createPatientStory(story) {
  const created = {
    id: createId(),
    status: 'approved',
    created_date: new Date().toISOString(),
    ...story,
  };

  write('patientStories', [created, ...listSubmittedStories()]);
  return created;
}

export function saveNewsletterSubscription(subscription) {
  write('newsletterSubscriptions', [
    ...read('newsletterSubscriptions'),
    {
      id: createId(),
      created_date: new Date().toISOString(),
      ...subscription,
    },
  ]);
}
