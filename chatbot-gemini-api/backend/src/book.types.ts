export interface Book {
  id: string;
  title: string;
  subtitle?: string | null;
  author: string;
  synopsis: string;
  genres: string[];
  themes: string[];
  readingPace: 'leve' | 'moderado' | 'intenso';
  pages: number;
  cddCode?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  text: string;
  recommendations: Book[];
  profileComplete: boolean;
}
