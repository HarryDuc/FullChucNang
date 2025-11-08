import { PartialType } from '@nestjs/mapped-types';
import { CreateUpimgDto } from './create-upimg.dto';
 
export class UpdateUpimgDto extends PartialType(CreateUpimgDto) {} 