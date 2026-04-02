import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { ProgramsModule } from '../programs/programs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]),
    ProgramsModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
