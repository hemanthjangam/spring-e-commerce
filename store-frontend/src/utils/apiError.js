export function extractApiErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data?.error) {
    return data.error;
  }

  if (data?.message) {
    return data.message;
  }

  if (data && typeof data === 'object') {
    const validationMessages = Object.values(data).filter(
      (value) => typeof value === 'string' && value.trim()
    );

    if (validationMessages.length > 0) {
      return validationMessages.join(', ');
    }
  }

  return error?.message || fallbackMessage;
}
