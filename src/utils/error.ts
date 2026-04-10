export function getErrorMessage(error: any, fallback = 'Something went wrong. Please try again.'): string {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string') {
    return responseData;
  }

  if (responseData && typeof responseData === 'object') {
    const flattened = Object.values(responseData)
      .flatMap(value => (Array.isArray(value) ? value : [value]))
      .filter(Boolean)
      .map(value => (typeof value === 'string' ? value : ''))
      .filter(Boolean);

    if (flattened.length > 0) {
      return flattened.join('\n');
    }
  }

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    fallback
  );
}
