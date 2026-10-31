export interface Admin {
  id: string;
  email: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
}