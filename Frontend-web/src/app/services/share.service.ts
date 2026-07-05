import { Injectable } from '@angular/core';

export type SharePlatform = 'native' | 'whatsapp' | 'linkedin' | 'facebook' | 'instagram' | 'x' | 'copy';

export interface SharePayload {
  title: string;
  text?: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class ShareService {
  async share(payload: SharePayload, platform: SharePlatform = 'native'): Promise<'shared' | 'copied' | 'opened' | 'cancelled'> {
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share(payload);
        return 'shared';
      } catch {
        return 'cancelled';
      }
    }

    if (platform === 'copy' || platform === 'native') {
      await this.copy(payload.url);
      return 'copied';
    }

    if (platform === 'instagram') {
      await this.copy(payload.url);
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      return 'copied';
    }

    const target = this.platformUrl(payload, platform);

    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer');
      return 'opened';
    }

    await this.copy(payload.url);
    return 'copied';
  }

  async copy(value: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch {
        // Fall back to a temporary textarea when clipboard permissions are blocked.
      }
    }

    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', 'true');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }

  private platformUrl(payload: SharePayload, platform: SharePlatform): string | null {
    const title = payload.text || payload.title;
    const encodedUrl = encodeURIComponent(payload.url);
    const encodedTitle = encodeURIComponent(title);

    if (platform === 'whatsapp') {
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${payload.url}`)}`;
    }

    if (platform === 'linkedin') {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }

    if (platform === 'facebook') {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    }

    if (platform === 'x') {
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    }

    return null;
  }
}
