export interface Book {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  genres: string[];
  themes: string[];
  readingPace: 'leve' | 'moderado' | 'intenso';
  pages: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Book[];
}

export interface ChatReply {
  text: string;
  recommendations: Book[];
  profileComplete: boolean;
}
