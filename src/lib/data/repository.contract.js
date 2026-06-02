

export const REPOSITORY_METHOD_NAMES = [
  'getItems',
  'setItems',
  'getConsumption',
  'setConsumption',
  'getPreferences',
  'setPreferences',
];

export function isDataRepository(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return REPOSITORY_METHOD_NAMES.every(
    (name) => typeof value[name] === 'function',
  );
}

export function assertDataRepository(candidate, label = 'repository') {
  if (!isDataRepository(candidate)) {
    const missing = REPOSITORY_METHOD_NAMES.filter(
      (name) => typeof candidate?.[name] !== 'function',
    );
    throw new TypeError(
      `${label} must implement DataRepository (${REPOSITORY_METHOD_NAMES.join(', ')}). Missing or invalid: ${missing.join(', ') || 'not an object'}`,
    );
  }
}
