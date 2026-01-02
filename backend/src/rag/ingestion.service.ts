import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureOpenAIEmbeddings } from '@langchain/openai';
import { AzureAISearchVectorStore } from "@langchain/community/vectorstores/azure_aisearch";
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';


import { Document } from '@langchain/core/documents';
import * as fs from 'fs';
import * as pdf from 'pdf-parse';

@Injectable()
export class IngestionService {
    private readonly logger = new Logger(IngestionService.name);

    constructor(private readonly configService: ConfigService) { }

    async processFile(file: Express.Multer.File) {
        this.logger.log(`Processing file: ${file.originalname}`);

        try {
            // 1. Extract text based on file type
            let text = '';
            if (file.mimetype === 'application/pdf') {
                const dataBuffer = file.buffer;
                const data = await pdf(dataBuffer);
                text = data.text;
            } else {
                // Assume text-based (markdown, txt, etc.)
                text = file.buffer.toString('utf-8');
            }

            // 2. Split text into chunks
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });

            const docs = await splitter.createDocuments(
                [text],
                [{ source: file.originalname, uploadedAt: new Date().toISOString() }]
            );

            this.logger.log(`Generated ${docs.length} chunks from ${file.originalname}`);

            // 3. Embed and Index (Real implementation)
            // Note: This requires valid Azure configuration to work. 
            // mocking the call if valid keys are missing to prevent crash during demo.

            const endpoint = this.configService.get('AZURE_SEARCH_ENDPOINT');
            const key = this.configService.get('AZURE_SEARCH_KEY');

            if (!endpoint || endpoint.includes('your_search_endpoint')) { // Check for dummy config
                this.logger.warn('Azure Search credentials not configured. Skipping actual indexing.');
                return {
                    status: 'success',
                    message: `Processed ${file.originalname} into ${docs.length} chunks (Indexing skipped - Dummy Config)`,
                    chunks: docs.length
                };
            }

            const embeddings = new AzureOpenAIEmbeddings({
                azureOpenAIApiKey: this.configService.get('AZURE_OPENAI_API_KEY'),
                azureOpenAIApiVersion: this.configService.get('AZURE_OPENAI_API_VERSION'),
                azureOpenAIApiInstanceName: this.configService.get('AZURE_OPENAI_INSTANCE_NAME'),
                azureOpenAIApiDeploymentName: 'text-embedding-ada-002',
            });

            const vectorStore = new AzureAISearchVectorStore(embeddings, {
                endpoint: endpoint,
                key: key,
                indexName: 'aem-docs',
                search: {
                    type: 'similarity',
                }
            });

            await vectorStore.addDocuments(docs);
            this.logger.log(`Successfully indexed ${docs.length} documents.`);

            return {
                status: 'success',
                message: `Successfully processed and indexed ${file.originalname}`,
                chunks: docs.length
            };

        } catch (error) {
            this.logger.error(`Error processing file ${file.originalname}:`, error);
            throw error;
        }
    }
}
