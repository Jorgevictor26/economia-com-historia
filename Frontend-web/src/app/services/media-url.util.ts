export function normalizeMediaUrl(value: string | null | undefined): string | undefined {
  const url = value?.trim();

  if (!url) {
    return undefined;
  }

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return url;
  }

  if (url.startsWith('storage/')) {
    return `/${url}`;
  }

  return `/storage/${url}`;
}
