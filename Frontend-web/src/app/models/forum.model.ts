export interface ForumRoom {
  id: string;
  ownerId?: string;
  creatorName?: string;
  name: string;
  visibility: 'public' | 'private';
  accessCode?: string | null;
  joinApprovalRequired?: boolean;
  members: number;
  activeDebates: number;
  description: string;
  category?: string;
  objective?: string;
  inviteEmails?: string[];
  protectedByPassword?: boolean;
  linkedContents: ForumLinkedContent[];
}

export interface ForumLinkedContent {
  id: string;
  title: string;
  type: string;
  meta: string;
}

export interface ForumMessage {
  id: string;
  roomId: string;
  author: string;
  body: string;
  reactions: number;
  createdAt: string;
}
