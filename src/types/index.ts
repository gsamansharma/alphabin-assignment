export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface SearchResponse {
  users: User[];
  total: number;
  queryTimeMs: number;
}
