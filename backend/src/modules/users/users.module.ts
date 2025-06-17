// users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule), // 👈 Import AuthModule để sử dụng JwtService và JwtAuthGuard
    forwardRef(() => PermissionsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
