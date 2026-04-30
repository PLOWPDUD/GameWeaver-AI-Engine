export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  history?: string[];
  historyIndex?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type TabMode = 'chat' | 'ask' | 'plan' | 'code';
