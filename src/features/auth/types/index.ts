export interface RegisterRequest {
  phone: string
  password: string
}

export interface RegisterResponse {
  userId: string
  phone?: string | null
}

export interface RegisterError {
  message: string
  code?: string
}

export interface LoginRequest {
  phone: string
  password: string
}

export interface LoginResponse {
  userId: string
  phone?: string | null
  accessToken?: string
}

export interface LoginError {
  message: string
  code?: string
}
