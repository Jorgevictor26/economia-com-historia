export interface ForumRoom {
  id: string;
  name: string;
  visibility: 'public' | 'private';
  members: number;
  activeDebates: number;
  description: string;
}

export interface ForumMessage {
  id: string;
  roomId: string;
  author: string;
  body: string;
  reactions: number;
  createdAt: string;
}
