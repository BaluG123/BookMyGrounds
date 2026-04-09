export function getErrorMessage(error: any, fallback = 'Something went wrong. Please try again.'): string {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}
