import { Module } from '@nestjs/common';
import { AemController } from './aem.controller';
import { AemService } from './aem.service';
import { SearchModule } from '../search/search.module';

@Module({
    imports: [SearchModule],
    controllers: [AemController],
    providers: [AemService],
    exports: [AemService],
})
export class AemModule { }
