// Base types for the note editor
export interface MediaItem {
  id: string;
  type: 'image' | 'gif' | 'sticker';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface DrawingData {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
}

export interface SignatureData {
  type: 'drawn' | 'typed';
  data: string; // base64 for drawn, text for typed
  font?: string; // for typed signatures
}

export interface NoteContent {
  id?: string;
  recipientName: string;
  contributorName?: string;
  text: string;
  formatting: {
    fontFamily: string;
    fontSize: string;
    bold: boolean;
    italic: boolean;
  };
  media: MediaItem[];
  drawings: DrawingData[];
  signature?: SignatureData;
  backgroundColor: string;
  theme: string;
  wordCount: number;
  characterCount: number;
}

export interface BackgroundTheme {
  id: string;
  name: string;
  preview: string;
  cssClass: string;
  gradient?: string;
  pattern?: string;
}

export interface FontOption {
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'script' | 'display';
  preview: string;
}

export interface StickerCategory {
  id: string;
  name: string;
  stickers: {
    id: string;
    url: string;
    alt: string;
    keywords: string[];
  }[];
}

// Event and contribution types
export interface ContributionEvent {
  id: string;
  title: string;
  type: 'individual' | 'roundrobin';
  recipientName: string;
  recipientEmail: string;
  deadline: string;
  description?: string;
  status: 'open' | 'closed';
  organizerName: string;
}

export interface Contribution {
  id: string;
  eventId: string;
  recipientName: string;
  content: NoteContent;
  submittedAt: string;
  isAnonymous: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GiphyGif {
  id: string;
  url: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    fixed_width: {
      url: string;
      width: string;
      height: string;
    };
  };
} 