import { IsArray, IsString } from 'class-validator';

export class UpdateUserPermissionsDto {
  @IsString()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}