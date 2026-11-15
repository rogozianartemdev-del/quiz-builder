import type { User } from "../user.type";


export interface AuthResponse {
  token: string;
  user:User;
}