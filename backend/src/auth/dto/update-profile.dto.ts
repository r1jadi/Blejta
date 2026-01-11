import { IsEmail, IsString, MinLength, IsOptional, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  newPassword?: string;

  @IsString()
  @IsOptional()
  @ValidateIf(o => o.newPassword)
  confirmPassword?: string;

  @IsString()
  @MinLength(6)
  currentPassword: string;
}
