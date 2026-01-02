import { Module } from '@nestjs/common';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { AemModule } from '../aem/aem.module';
import { SearchService } from '../search/search.service';

@Module({
    imports: [AemModule],
    controllers: [AiAssistantController],
    providers: [AiAssistantService, SearchService],
    exports: [AiAssistantService],
})
export class AiAssistantModule { }
