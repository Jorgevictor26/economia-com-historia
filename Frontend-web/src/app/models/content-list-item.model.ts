export interface ContentListItem {
  id: string;
  category: string;
  contentType: string;
  meta: string;
  title: string;
  excerpt: string;
  author: string;
  authorInitials: string;
  imageUrl?: string;
  premium?: boolean;
  reactionsCount?: number;
  commentsCount?: number;
  likedByMe?: boolean;
  searchText?: string;
}
