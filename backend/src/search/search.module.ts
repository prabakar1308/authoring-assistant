import { Module, forwardRef } from '@nestjs/common';
import { SearchService } from './search.service';
import { AemModule } from '../aem/aem.module';

@Module({
    imports: [forwardRef(() => AemModule)],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule { }
