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
  accessStatus?: 'none' | 'pending' | 'invited' | 'member' | 'rejected' | 'invitation_rejected' | string;
  canView?: boolean;
  protectedByPassword?: boolean;
  linkedContents: ForumLinkedContent[];
  artifacts?: ForumArtifact[];
}

export interface ForumLinkedContent {
  id: string;
  title: string;
  type: string;
  meta: string;
}

export interface ForumArtifact {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface ForumMessage {
  id: string;
  roomId: string;
  author: string;
  body: string;
  reactions: number;
  createdAt: string;
}
