import { getGeminiModel } from "../config/llm";
import { processNewLink } from "../ingest/content-extractor";
import { NewsMessage } from "../models/message";
import { QueryResult } from "../models/query";
import { extractUrls } from "../utils/extract-url";
import { logger } from "../utils/logger";
import { retrieveRelevantChunks } from "./retriever";

export async function generateResponse(query: string): Promise<QueryResult> {
    try {
        const urls = extractUrls(query);
        if (urls.length > 0) {
            logger.info(`Found ${urls.length} URLs in the query`);
            
            for (const url of urls) {
                try {                    
                    const newsMessage: NewsMessage = {
                        source: new URL(url).hostname.trim(),
                        url: url.trim(),
                    };
                    
                    logger.info(`Processing URL: ${newsMessage.url} from ${newsMessage.source}`);
                    await processNewLink(newsMessage);
                    logger.info(`Successfully processed URL: ${newsMessage.url}`);
                } catch (err) {
                    logger.error(`Failed to process URL ${url}: ${err}`);
                }
            }
        }

        const relevantArticles = await retrieveRelevantChunks(query);
        if (relevantArticles.length === 0) {
            return {
                answer: "I don't have enough information to answer that question based on the articles in my database.",
                sources: []
            };
        }

        const model = getGeminiModel();
        const prompt = createSystemPrompt() + query;
        const result = await model.generateContent(prompt);

        const response = result.response.text();
        return {
            answer: response,
            sources: relevantArticles.map((article) => article.metadata.source)
        };
    } catch (error) {
        logger.error(`Error generating response: ${error}`);
        throw new Error(`Error generating response: ${error}`);
    }
}

function createSystemPrompt(): string {
    return `
    You are a helpful AI assistant that answers questions based on news articles. 
    I will provide you with a query and context from relevant news articles. 
    
    Follow these instructions:
    
    1. Answer the query using only information from the provided context.
    2. If the context doesn't contain relevant information, say so clearly.
    3. Do not make up information or cite sources not provided.
    4. Provide a clear, concise, and accurate response.
    5. If appropriate, mention which sources (by title) contain the information you're using.
    
    ANSWER:
    `
}
