export type ContentType = 'historia' | 'economia' | 'podcast' | 'jindungo';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Content {
  id: string;
  title: string;
  excerpt: string;
  type: ContentType;
  status: ContentStatus;
  author: string;
  coverUrl: string;
  premium: boolean;
  publishedAt: string;
  readingMinutes: number;
}
