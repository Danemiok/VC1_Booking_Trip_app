export interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  text: string;
  created_at: string;
  type?: 'system' | 'user';
  attachment?: {
    name: string;
    mimeType: string;
    dataUrl?: string;
  };
}

export interface Member {
  user_email: string;
  user_name: string;
  role: 'Leader' | 'Member';
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
}

export interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  votes: number;
}

export interface StoredGroup {
  id: string;
  accessCode: string;
  name: string;
  members: Member[];
  messages: Message[];
  polls: Poll[];
  itinerary: ItineraryItem[];
}
