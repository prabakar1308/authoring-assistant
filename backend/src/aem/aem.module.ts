import { Module } from '@nestjs/common';
import { AemController } from './aem.controller';
import { AemService } from './aem.service';

@Module({
    controllers: [AemController],
    providers: [AemService],
    exports: [AemService],
})
export class AemModule { }
