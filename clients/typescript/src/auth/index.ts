export { insecureAuthToken } from './insecure'

export enum AuthStatus {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
  EXPIRED = 'EXPIRED',
}

export interface AuthState {
  clientId: string
  token: string
  status: AuthStatus
}

export interface AuthConfig {
  clientId?: string
  token: string
}

export type AuthCredentials = Pick<AuthState, 'clientId' | 'token'>

export interface TokenClaims {
  [key: string]: any
}
