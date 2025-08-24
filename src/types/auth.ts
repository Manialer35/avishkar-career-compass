export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
    [key: string]: any;
  };
  [key: string]: any;
}