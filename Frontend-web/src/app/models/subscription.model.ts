export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface SubscribedJindungoText {
  id: string;
  title: string;
  excerpt: string;
  subscribedAt: string;
  readingMinutes: number;
  route: string;
  imageUrl?: string;
  author?: string;
  status?: 'available' | 'pending' | 'subscribed' | 'rejected';
}

export interface JindungoSubscriptionRequest {
  id: string;
  userName: string;
  email: string;
  textTitle: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}
