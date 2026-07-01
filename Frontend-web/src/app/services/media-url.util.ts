import { environmentConfig } from './environment.config';

interface MediaUrlOptions {
  contentId?: number | string | null;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

function storageUrl(path: string): string {
  const baseUrl = environmentConfig.mediaBaseUrl.replace(/\/$/, '');

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function normalizeMediaUrl(value: string | null | undefined, options: MediaUrlOptions = {}): string | undefined {
  const url = value?.trim();

  if (!url) {
    return undefined;
  }

  if (/^(data:|blob:)/i.test(url)) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);

      if (parsed.pathname.startsWith('/storage/')) {
        return storageUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`);
      }
    } catch {
      return url;
    }

    return url;
  }

  if (url.startsWith('/')) {
    if (url.startsWith('/storage/')) {
      return storageUrl(url);
    }

    return url;
  }

  if (url.startsWith('storage/')) {
    return storageUrl(`/${url}`);
  }

  if (options.contentId && options.mediaType && /^[^/\\]+\.[a-z0-9]+(\?.*)?$/i.test(url)) {
    return storageUrl(`/storage/contents/${options.contentId}/${options.mediaType}/${url}`);
  }

  return storageUrl(`/storage/${url}`);
}
