import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    async getComponentProps(url: string, selector: string): Promise<string | null> {
        try {
            this.logger.log(`Fetching ${url} to search for component ${selector}`);
            const { data } = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(data);
            const el = $(`[data-component="${selector}"]`);

            if (el.length > 0) {
                return el.first().attr('data-props') || null;
            }
            return null;
        } catch (error) {
            this.logger.error(`Error fetching/parsing URL ${url}: ${error.message}`);
            return null;
        }
    }

    async searchByComponent(selector: string, urls: { id: number, value: string }[], helperProps?: string[]) {
        const results: any[] = [];
        for (const url of urls) {
            const props = await this.getComponentProps(url.value, selector);
            if (props) {
                let parsedProps = {};
                try {
                    parsedProps = JSON.parse(props);
                } catch (e) {
                    this.logger.warn(`Failed to parse props for ${url.value}`);
                }

                let helpers = {};
                if (helperProps) {
                    helperProps.forEach(prop => {
                        helpers[prop] = parsedProps[prop];
                    });
                }

                results.push({
                    url: url.value,
                    id: url.id,
                    rawProps: props,
                    ...helpers
                });
            }
        }
        return results;
    }

    async searchByPage(url: string, components: { name: string, selector: string, helperProps?: string[] }[]) {
        try {
            const { data } = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(data);
            const results: any[] = [];

            for (const comp of components) {
                const el = $(`[data-component="${comp.selector}"]`);
                if (el.length > 0) {
                    const props = el.first().attr('data-props');
                    let parsedProps = {};
                    if (props) {
                        try {
                            parsedProps = JSON.parse(props);
                        } catch (e) { }
                    }

                    let helpers = {};
                    if (comp.helperProps) {
                        comp.helperProps.forEach(prop => {
                            helpers[prop] = parsedProps[prop];
                        });
                    }

                    results.push({
                        name: comp.name,
                        selector: comp.selector,
                        rawProps: props,
                        helpers
                    });
                }
            }
            return results;
        } catch (error) {
            this.logger.error(`Error in searchByPage for ${url}: ${error.message}`);
            return [];
        }
    }
}
