import { Body, Controller, Post } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

class AssistantQueryDto {
    query: string;
}

@ApiTags('assistant')
@Controller('assistant')
export class AiAssistantController {
    constructor(private readonly assistantService: AiAssistantService) { }

    @Post('query')
    @ApiOperation({ summary: 'Consult the AEM AI Assistant' })
    @ApiResponse({ status: 200, description: 'Answer and processing details returned.' })
    async query(@Body() queryDto: AssistantQueryDto) {
        return this.assistantService.process(queryDto.query);
    }
}
