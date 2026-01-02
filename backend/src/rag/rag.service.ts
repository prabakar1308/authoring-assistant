import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { StateGraph, END, START } from '@langchain/langgraph';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { Document } from "@langchain/core/documents";
import { AzureAISearchVectorStore } from "@langchain/community/vectorstores/azure_aisearch";

interface RagState {
    messages: BaseMessage[];
    context: Document[];
    answer: string;
}

@Injectable()
export class RagService {
    private readonly logger = new Logger(RagService.name);

    constructor(private configService: ConfigService) { }

    async ask(query: string) {
        const llm = new AzureChatOpenAI({
            azureOpenAIApiKey: this.configService.get('AZURE_OPENAI_API_KEY'),
            azureOpenAIApiVersion: this.configService.get('AZURE_OPENAI_API_VERSION'),
            azureOpenAIApiInstanceName: this.configService.get('AZURE_OPENAI_INSTANCE_NAME'),
            deploymentName: this.configService.get('AZURE_OPENAI_DEPLOYMENT_NAME') || 'gpt-4',
            temperature: 0,
        });

        const retrieveNode = async (state: RagState) => {
            this.logger.log('Retrieving documents...');
            try {
                // In a real scenario, initialize AzureSearch here or in constructor
                // const embeddings = new AzureOpenAIEmbeddings({
                //     azureOpenAIApiKey: this.configService.get('AZURE_OPENAI_API_KEY'),
                //     azureOpenAIApiVersion: this.configService.get('AZURE_OPENAI_API_VERSION'),
                //     azureOpenAIApiInstanceName: this.configService.get('AZURE_OPENAI_INSTANCE_NAME'),
                //     azureOpenAIApiDeploymentName: 'text-embedding-ada-002',
                // });
                // const vectorStore = new AzureSearch(embeddings, {
                //     search: {
                //         endpoint: this.configService.get('AZURE_SEARCH_ENDPOINT'),
                //         key: this.configService.get('AZURE_SEARCH_KEY'),
                //         indexName: 'aem-docs'
                //     }
                // });
                // const docs = await vectorStore.similaritySearch(state.messages[state.messages.length - 1].content as string);

                // Mocking for demonstration
                const mockDocs = [
                    new Document({ pageContent: "AEM Components are reusable building blocks for content." }),
                    new Document({ pageContent: "Use the Template Editor to manage AEM templates." }),
                    new Document({ pageContent: "Asset workflows process images and videos automatically." })
                ];
                return { context: mockDocs };
            } catch (e) {
                this.logger.error('Error in retrieve:', e);
                return { context: [] };
            }
        };

        const generateNode = async (state: RagState) => {
            this.logger.log('Generating answer...');
            const prompt = ChatPromptTemplate.fromTemplate(`You are an AEM (Adobe Experience Manager) expert assistant.
Use the following context to answer the user's question. If you don't know, say you don't know.

Context:
{context}

Question: {question}`);

            const chain = prompt.pipe(llm).pipe(new StringOutputParser());
            const lastMessage = state.messages[state.messages.length - 1];
            const contextText = state.context.map((d) => d.pageContent).join('\n\n');

            const answer = await chain.invoke({
                context: contextText,
                question: lastMessage.content as string,
            });

            return { answer, messages: [new AIMessage(answer)] };
        };

        const graph = new StateGraph<RagState>({
            channels: {
                messages: {
                    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
                    default: () => [],
                },
                context: {
                    reducer: (x: Document[], y: Document[]) => y,
                    default: () => [],
                },
                answer: {
                    reducer: (x: string, y: string) => y,
                    default: () => "",
                }
            }
        })
            .addNode('retrieve', retrieveNode)
            .addNode('generate', generateNode)
            .addEdge(START, 'retrieve')
            .addEdge('retrieve', 'generate')
            .addEdge('generate', END);

        const app = graph.compile();

        const result = await app.invoke({
            messages: [new HumanMessage(query)],
        });

        return {
            answer: result.answer,
            context: result.context,
        };
    }
}
