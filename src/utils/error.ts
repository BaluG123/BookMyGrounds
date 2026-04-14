function formatFieldLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function getErrorMessage(error: any, fallback = 'Something went wrong. Please try again.'): string {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string') {
    return responseData;
  }

  if (responseData && typeof responseData === 'object') {
    const flattened = Object.entries(responseData)
      .flatMap(([key, value]) => {
        const values = Array.isArray(value) ? value : [value];
        return values
          .filter(Boolean)
          .map(item => {
            if (typeof item !== 'string') {
              return '';
            }
            if (key === 'non_field_errors' || key === 'detail' || key === 'error' || key === 'message') {
              return item;
            }
            return `${formatFieldLabel(key)}: ${item}`;
          });
      })
      .filter(Boolean);

    if (flattened.length > 0) {
      return Array.from(new Set(flattened)).join('\n');
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
