export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: {
    url: string;
    localPath: string;
  };
  role: "USER" | "ADMIN";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  role?: "USER" | "ADMIN";
}

export interface AuthResponse {
  statusCode: number;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
}
