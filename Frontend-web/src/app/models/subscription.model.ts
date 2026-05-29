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
}
