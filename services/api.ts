const BASE_URL = "https://miniplayparty.fly.dev";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
};

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ errors: [{ message: "Request failed" }] }));
    throw new Error(errorData.errors?.[0]?.message ?? "Request failed");
  }

  return response.json();
}

// Auth types
export type Token = { type: string; token: string };
export type User = {
  id: number;
  username: string;
  name: string;
  avatar?: string;
  isAdmin?: boolean;
};

// Room types
export type Room = {
  id: string;
  name: string;
  avatar?: string;
  users: User[];
  requests: User[];
};

// Auth API
export const authApi = {
  register: (data: {
    username: string;
    password: string;
    name: string;
    avatar?: string;
  }) => request<Token>("/auth/register", { method: "POST", body: data }),

  login: (data: { username: string; password: string }) =>
    request<Token>("/auth/login", { method: "POST", body: data }),

  getUser: (token: string) => request<User>("/auth/user", { token }),

  updateUser: (
    token: string,
    data: { name?: string; avatar?: string; password?: string },
  ) => request<User>("/auth/user", { method: "PUT", body: data, token }),

  deleteUser: (token: string) =>
    request<{ message: string }>("/auth/user", { method: "DELETE", token }),
};

// Rooms API
export const roomsApi = {
  list: (token: string) => request<{ rooms: Room[] }>("/rooms", { token }),

  create: (token: string, data: { name: string; avatar?: string }) =>
    request<Room>("/room", { method: "POST", body: data, token }),

  get: (token: string, id: string) => request<Room>(`/room/${id}`, { token }),

  update: (
    token: string,
    id: string,
    data: {
      name: string;
      avatar?: string;
      userIds?: number[];
      adminIds?: number[];
    },
  ) => request<Room>(`/room/${id}`, { method: "PUT", body: data, token }),

  delete: (token: string, id: string) =>
    request<{ message: string }>(`/room/${id}`, { method: "DELETE", token }),

  join: (token: string, id: string) =>
    request<{ message: string }>(`/room/join/${id}`, { method: "POST", token }),

  leave: (token: string, id: string) =>
    request<{ message: string }>(`/room/leave/${id}`, {
      method: "POST",
      token,
    }),

  handleUser: (
    token: string,
    id: string,
    data: { accept?: number[]; reject?: number[] },
  ) =>
    request<Room>(`/room/handle-user/${id}`, {
      method: "POST",
      body: data,
      token,
    }),
};
