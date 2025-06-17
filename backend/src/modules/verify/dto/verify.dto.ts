export class SendVerificationDto {
  email: string;
}

export class VerifyEmailDto {
  email: string;
  code: string;
}

export class ResendVerificationDto {
  email: string;
}
