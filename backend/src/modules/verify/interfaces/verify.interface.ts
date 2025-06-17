export interface IVerificationResponse {
  success: boolean;
  message: string;
}

export interface IVerificationCode {
  code: string;
  expiresAt: Date;
}
