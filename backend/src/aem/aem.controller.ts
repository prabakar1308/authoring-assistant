import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AemService } from './aem.service';
import { SearchService } from '../search/search.service';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('aem')
@Controller('aem')
export class AemController {
    constructor(
        private readonly aemService: AemService,
        private readonly searchService: SearchService
    ) { }

    @Get('analyze-page')
    @ApiOperation({ summary: 'Analyze a live AEM page for components and their data props' })
    @ApiQuery({ name: 'url', description: 'The URL of the AEM page to analyze' })
    async analyzePage(@Query('url') url: string) {
        const store = this.aemService.getStore();
        return this.searchService.searchByPage(url, store.components as any);
    }

    @Get('search-component')
    @ApiOperation({ summary: 'Search for all instances of a component across tracked URLs' })
    @ApiQuery({ name: 'selector', description: 'The selector of the component to search for' })
    async searchComponent(@Query('selector') selector: string) {
        const store = this.aemService.getStore();
        const comp = store.components.find(c => c.selector === selector);
        if (!comp) return { pages: [] };
        const pages = await this.searchService.searchByComponent(selector, store.urls as any, comp.helperProps);
        return { pages };
    }

    @Get('store')
    @ApiOperation({ summary: 'Get the current AEM Setup configuration' })
    async getStore() {
        return this.aemService.getStore();
    }

    // Components
    @Post('components')
    @ApiOperation({ summary: 'Add a new component' })
    async addComponent(@Body() component: any) {
        return this.aemService.addComponent(component);
    }

    @Put('components/:id')
    @ApiOperation({ summary: 'Update a component' })
    async updateComponent(@Param('id', ParseIntPipe) id: number, @Body() component: any) {
        return this.aemService.updateComponent(id, component);
    }

    @Delete('components/:id')
    @ApiOperation({ summary: 'Delete a component' })
    async deleteComponent(@Param('id', ParseIntPipe) id: number) {
        return this.aemService.deleteComponent(id);
    }

    // URLs (Pages)
    @Post('urls')
    @ApiOperation({ summary: 'Add a new target URL' })
    async addUrl(@Body() url: any) {
        return this.aemService.addUrl(url);
    }

    @Put('urls/:id')
    @ApiOperation({ summary: 'Update a target URL' })
    async updateUrl(@Param('id', ParseIntPipe) id: number, @Body() url: any) {
        return this.aemService.updateUrl(id, url);
    }

    @Delete('urls/:id')
    @ApiOperation({ summary: 'Delete a target URL' })
    async deleteUrl(@Param('id', ParseIntPipe) id: number) {
        return this.aemService.deleteUrl(id);
    }

    @Post('update-page-props')
    @ApiOperation({ summary: 'Update (override) component props for a specific page in the current session' })
    async updatePageProps(@Body() body: { url: string, selector: string, props: any }) {
        return this.aemService.updatePageProps(body.url, body.selector, body.props);
    }
}
