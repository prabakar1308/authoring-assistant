import { Module } from '@nestjs/common';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { AemModule } from '../aem/aem.module';
import { SearchModule } from '../search/search.module';

@Module({
    imports: [AemModule, SearchModule],
    controllers: [AiAssistantController],
    providers: [AiAssistantService],
    exports: [AiAssistantService],
})
export class AiAssistantModule { }
