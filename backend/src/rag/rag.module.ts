import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { IngestionService } from './ingestion.service';
import { AemModule } from '../aem/aem.module';

@Module({
    imports: [AemModule],
    controllers: [RagController],
    providers: [RagService, IngestionService],
})
export class RagModule { }
