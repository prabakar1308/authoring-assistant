import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureChatOpenAI } from '@langchain/openai';
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { StateGraph, END, START } from '@langchain/langgraph';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { Document } from "@langchain/core/documents";
import { AemService } from '../aem/aem.service';

interface RagState {
    messages: BaseMessage[];
    context: Document[];
    answer: string;
}

@Injectable()
export class RagService {
    private readonly logger = new Logger(RagService.name);

    constructor(
        private configService: ConfigService,
        private aemService: AemService
    ) { }

    async ask(query: string) {
        const provider = this.configService.get('LLM_PROVIDER') || 'azure';
        let llm: any;

        if (provider === 'groq') {
            this.logger.log('Using Groq provider');
            llm = new ChatGroq({
                apiKey: this.configService.get('GROQ_API_KEY'),
                model: this.configService.get('GROQ_MODEL') || 'mixtral-8x7b-32768',
                temperature: 0,
            });
        } else {
            this.logger.log('Using Azure provider');
            llm = new AzureChatOpenAI({
                azureOpenAIApiKey: this.configService.get('AZURE_OPENAI_API_KEY'),
                azureOpenAIApiVersion: this.configService.get('AZURE_OPENAI_API_VERSION'),
                azureOpenAIApiInstanceName: this.configService.get('AZURE_OPENAI_INSTANCE_NAME'),
                deploymentName: this.configService.get('AZURE_OPENAI_DEPLOYMENT_NAME') || 'gpt-4',
                temperature: 0,
            });
        }

        const retrieveNode = async (state: RagState) => {
            this.logger.log('Retrieving documents...');
            try {
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
Use the following context including the current AEM Setup configuration (Store) to answer the user's question. 
If you don't know, say you don't know based on the provided information.

AEM Setup Configuration (Store):
{aem_store}

Context from Knowledge Base:
{context}

Question: {question}`);

            const chain = prompt.pipe(llm).pipe(new StringOutputParser());
            const lastMessage = state.messages[state.messages.length - 1];
            const contextText = state.context.map((d) => d.pageContent).join('\n\n');
            const aemStoreText = JSON.stringify(this.aemService.getStore(), null, 2);

            const answer = await chain.invoke({
                aem_store: aemStoreText,
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
