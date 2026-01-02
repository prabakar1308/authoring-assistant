import { Controller, Get } from '@nestjs/common';
import { AemService } from './aem.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('aem')
@Controller('aem')
export class AemController {
    constructor(private readonly aemService: AemService) { }

    @Get('store')
    @ApiOperation({ summary: 'Get the current AEM Setup configuration' })
    async getStore() {
        return this.aemService.getStore();
    }
}
