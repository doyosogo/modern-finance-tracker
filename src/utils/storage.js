export function getFromStorage(key, fallbackValue = []) {
  const savedData = localStorage.getItem(key)

  if (!savedData) {
    return fallbackValue
  }

  return JSON.parse(savedData)
}

export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}