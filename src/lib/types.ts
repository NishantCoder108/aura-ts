export type AuthStatus = "loading" | "authenticated" | "guest";

export interface User {
  id: string;
  firstName: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  user: User;
}

export interface LabelSummary {
  label: string;
  itemCount: number;
}

export interface Item {
  id: string;
  userId: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  title: string;
  label: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ViewSelection =
  | { type: "all" }
  | { type: "favorites" }
  | { type: "label"; label: string };
