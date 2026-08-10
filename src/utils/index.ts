export const isJsonString = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(
    typeof value === 'string' ? new Date(value) : value,
  );
