export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
}
