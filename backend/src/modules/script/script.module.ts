import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScriptController } from './controllers/script.controller';
import { ScriptService } from './services/script.service';
import { Script, ScriptSchema } from './schemas/script.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Script.name, schema: ScriptSchema }]),
    PermissionsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ScriptController],
  providers: [ScriptService],
  exports: [ScriptService],
})
export class ScriptModule { }
