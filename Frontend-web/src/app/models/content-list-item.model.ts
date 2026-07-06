export interface ContentListItem {
  id: string;
  category: string;
  contentType: string;
  meta: string;
  title: string;
  excerpt: string;
  authorId?: string;
  author: string;
  authorInitials: string;
  ownerId?: string;
  imageUrl?: string;
  premium?: boolean;
  canReadPremium?: boolean;
  reactionsCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  likedByMe?: boolean;
  searchText?: string;
  authorPhotoUrl?: string;
}
