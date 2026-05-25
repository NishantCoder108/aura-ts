import type { AuthResponse, Item, LabelSummary } from "@/lib/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const AUTH_TOKEN_KEY = "zenplay_auth_token";
const LEGACY_AUTH_TOKEN_KEY = "urlvibe_auth_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Request failed";

    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const legacyToken = window.localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);

  if (!token && legacyToken) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
    window.localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    return legacyToken;
  }

  return token;
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
}

export function getSession() {
  return request<AuthResponse>("/api/auth/me");
}

export function signup(payload: {
  firstName: string;
  email: string;
  username: string;
  password: string;
}) {
  return request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: { identifier: string; password: string }) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return request<void>("/api/auth/logout", {
    method: "POST",
  });
}

export function getLabels() {
  return request<LabelSummary[]>("/api/labels");
}

export function getItems(params?: { view?: "all" | "favorites"; label?: string }) {
  const search = new URLSearchParams();

  if (params?.view) {
    search.set("view", params.view);
  }

  if (params?.label) {
    search.set("label", params.label);
  }

  const query = search.toString();
  return request<Item[]>(`/api/items${query ? `?${query}` : ""}`);
}

export function createItem(payload: {
  youtubeUrl: string;
  title: string;
  label: string;
}) {
  return request<Item>("/api/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateItem(
  itemId: string,
  payload: Partial<Pick<Item, "title" | "label" | "isFavorite">>,
) {
  return request<Item>(`/api/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteItem(itemId: string) {
  return request<void>(`/api/items/${itemId}`, {
    method: "DELETE",
  });
}

export function renameLabel(label: string, newLabel: string) {
  return request<Item[]>(`/api/labels/${encodeURIComponent(label)}/rename`, {
    method: "PATCH",
    body: JSON.stringify({ newLabel }),
  });
}
