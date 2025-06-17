import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum ScriptPosition {
  HEADER = 'header',
  MAIN = 'main',
  FOOTER = 'footer',
}

export class CreateScriptDto {
  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsEnum(ScriptPosition)
  position: ScriptPosition;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateScriptDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(ScriptPosition)
  @IsOptional()
  position?: ScriptPosition;

  @IsString()
  @IsOptional()
  description?: string;
}