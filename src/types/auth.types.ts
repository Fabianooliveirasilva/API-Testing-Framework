export interface AuthenticationRequest {
  readonly username: string;
  readonly password: string;
}

export interface AuthenticationResponse {
  readonly token: string;
}

export interface AuthenticationError {
  readonly reason: string;
}
