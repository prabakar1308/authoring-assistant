import { Body, Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';
import { IngestionService } from './ingestion.service';
import { ApiOperation, ApiResponse, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

class QueryDto {
    query: string;
}

@ApiTags('rag')
@Controller('rag')
export class RagController {
    constructor(
        private readonly ragService: RagService,
        private readonly ingestionService: IngestionService
    ) { }

    @Post('query')
    @ApiOperation({ summary: 'Ask a question about AEM setup' })
    @ApiResponse({ status: 200, description: 'Answer returned successfully.' })
    async ask(@Body() body: QueryDto) {
        return this.ragService.ask(body.query);
    }

    @Post('ingest')
    @ApiOperation({ summary: 'Upload file for ingestion' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async ingest(@UploadedFile() file: Express.Multer.File) {
        return this.ingestionService.processFile(file);
    }
}
