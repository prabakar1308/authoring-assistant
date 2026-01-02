import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureChatOpenAI } from '@langchain/openai';
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { AemService } from '../aem/aem.service';
import { SearchService } from '../search/search.service';

const AssistantAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    context: Annotation<string[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    intent: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => 'general',
    }),
    results: Annotation<any>({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
    answer: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => "",
    })
});

type AssistantState = typeof AssistantAnnotation.State;

@Injectable()
export class AiAssistantService {
    private readonly logger = new Logger(AiAssistantService.name);

    constructor(
        private configService: ConfigService,
        private aemService: AemService,
        private searchService: SearchService
    ) { }

    private getModel() {
        const provider = this.configService.get('LLM_PROVIDER') || 'azure';
        if (provider === 'groq') {
            return new ChatGroq({
                apiKey: this.configService.get('GROQ_API_KEY'),
                model: this.configService.get('GROQ_MODEL') || 'mixtral-8x7b-32768',
                temperature: 0,
            });
        }
        return new AzureChatOpenAI({
            azureOpenAIApiKey: this.configService.get('AZURE_OPENAI_API_KEY'),
            azureOpenAIApiVersion: this.configService.get('AZURE_OPENAI_API_VERSION'),
            azureOpenAIApiInstanceName: this.configService.get('AZURE_OPENAI_INSTANCE_NAME'),
            deploymentName: this.configService.get('AZURE_OPENAI_DEPLOYMENT_NAME') || 'gpt-4',
            temperature: 0,
        });
    }

    async process(query: string) {
        const llm = this.getModel();

        const routerNode = async (state: AssistantState) => {
            this.logger.log('Routing intent...');
            const prompt = ChatPromptTemplate.fromTemplate(`You are a router for an AEM Assistant. 
Classify the user's intent into ONE word:
- search_component: User wants to FIND WHERE a specific component (like 'hero' or 'teaser') is used on the site.
- search_page: User wants to see ALL components that exist on a specific URL.
- rag: User is asking 'HOW-TO' questions, asking for definitions, or general AEM processes.
- aem: User is asking about the current environment setup or configuration.
- general: Greeting or unrelated chat.

Question: {question}
Intent:`);
            const chain = prompt.pipe(llm).pipe(new StringOutputParser());
            const intent = await chain.invoke({ question: query });
            const cleanIntent = intent.trim().toLowerCase().replace(/['"().]/g, '');

            // Ensure the intent is valid
            const validIntents = ['search_component', 'search_page', 'aem', 'rag', 'general'];
            return { intent: validIntents.includes(cleanIntent) ? cleanIntent : 'general' };
        };

        const aemNode = async (state: AssistantState) => {
            this.logger.log('Executing AEM node...');
            const store = this.aemService.getStore();
            return {
                context: [`AEM Store Config: ${JSON.stringify(store)}`],
                results: store
            };
        };

        const ragNode = async (state: AssistantState) => {
            this.logger.log('Executing RAG node...');
            const docs = "AEM components are modular. Workflows automate tasks. Templates define structure.";
            return { context: [`RAG Knowledge Base: ${docs}`] };
        };

        const searchComponentNode = async (state: AssistantState) => {
            this.logger.log('Executing SearchByComponent node...');
            const store = this.aemService.getStore();
            const comp = store.components.find(c =>
                query.toLowerCase().includes(c.name.toLowerCase()) ||
                query.toLowerCase().includes(c.selector.toLowerCase())
            );

            if (comp) {
                const results = await this.searchService.searchByComponent(comp.selector, (store.urls as any), (comp as any).helperProps);
                const contextMsg = results.length > 0
                    ? `Found component ${comp.name} on ${results.length} pages: ${results.map(r => r.url).join(', ')}`
                    : `Search completed: The component "${comp.name}" was NOT found on any of the ${store.urls.length} tracked pages.`;

                return {
                    results: { component: comp, pages: results },
                    context: [contextMsg]
                };
            }
            return { context: ["Component not found in AEM Store configuration."] };
        };

        const searchPageNode = async (state: AssistantState) => {
            this.logger.log('Executing SearchByPage node...');
            const store = this.aemService.getStore();
            const targetUrl = store.urls.find(u => query.includes(u.value))?.value;
            if (targetUrl) {
                const results = await this.searchService.searchByPage(targetUrl, store.components as any);
                return {
                    results: { url: targetUrl, componentsVisible: results },
                    context: [`The page ${targetUrl} contains these components: ${results.map(r => r.name).join(', ')}`]
                };
            }
            return { context: ["URL not recognized in store. Please provide a full URL from the tracked list."] };
        };

        const generatorNode = async (state: AssistantState) => {
            this.logger.log('Generating final answer...');
            const prompt = ChatPromptTemplate.fromTemplate(`You are an expert AEM Assistant. 
Use the provided Context and Structured Results to answer the user's question accurately.

If the Intent is 'search_component' or 'search_page', summarize the findings clearly.
If no results are found in the Structured Results, state that clearly rather than saying information is missing.

Context:
{context}

Structured Results:
{results}

Intent: {intent}
Question: {question}
Answer:`);
            const chain = prompt.pipe(llm).pipe(new StringOutputParser());
            const answer = await chain.invoke({
                context: state.context.join('\n'),
                results: JSON.stringify(state.results, null, 2),
                intent: state.intent,
                question: query
            });
            return { answer };
        };

        const graph = new StateGraph(AssistantAnnotation)
            .addNode('router', routerNode)
            .addNode('rag', ragNode)
            .addNode('aem', aemNode)
            .addNode('search_component', searchComponentNode)
            .addNode('search_page', searchPageNode)
            .addNode('generator', generatorNode)
            .addEdge(START, 'router')
            .addConditionalEdges('router', (state) => {
                if (state.intent === 'rag') return 'rag';
                if (state.intent === 'aem') return 'aem';
                if (state.intent === 'search_component') return 'search_component';
                if (state.intent === 'search_page') return 'search_page';
                return 'generator';
            })
            .addEdge('rag', 'generator')
            .addEdge('aem', 'generator')
            .addEdge('search_component', 'generator')
            .addEdge('search_page', 'generator')
            .addEdge('generator', END);

        const app = graph.compile();
        const result = await app.invoke({ messages: [new HumanMessage(query)] });

        return {
            answer: result.answer,
            intent: result.intent,
            results: result.results
        };
    }
}
