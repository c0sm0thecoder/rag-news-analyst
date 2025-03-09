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

                    logger.info(
                        `Processing URL: ${newsMessage.url} from ${newsMessage.source}`
                    );
                    await processNewLink(newsMessage);
                    logger.info(
                        `Successfully processed URL: ${newsMessage.url}`
                    );
                } catch (err) {
                    logger.error(`Failed to process URL ${url}: ${err}`);
                }
            }
        }

        const relevantChunks = await retrieveRelevantChunks(query, 10);
        if (relevantChunks.length === 0) {
            return {
                answer: "I don't have enough information to answer that question based on the articles in my database.",
                sources: [],
            };
        }

        const context = relevantChunks
            .map((chunk) => {
                return `SOURCE: ${chunk.metadata.title || "Unknown"} (${
                    chunk.metadata.source || "Unknown"
                })\n${chunk.text || ""}\n`;
            })
            .join("\n---\n\n");

        const model = getGeminiModel();

        const prompt = `
        QUERY: ${query}

        CONTEXT:
        ${context}

        ${createSystemPrompt()}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const sources = relevantChunks
            .filter(
                (chunk) =>
                    chunk.metadata?.title ||
                    chunk.metadata?.url ||
                    chunk.metadata?.source
            )
            .map((chunk) => ({
                title: chunk.metadata.title || null,
                url: chunk.metadata.url || null,
                date: chunk.metadata.date || null,
                source: chunk.metadata.source || null,
            }));

        return {
            answer: text,
            sources: sources,
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
    
    1. ALWAYS provide a comprehensive answer to the query using information from the provided context.
    2. Do not simply state that you can answer the question - actually provide the full answer.
    3. Synthesize information from multiple sources when available.
    4. Include specific details, explanations, and examples from the context.
    5. If the context doesn't contain relevant information for some parts of the query, clearly state which parts you cannot answer.
    6. Do not make up information or cite sources not provided.
    7. Mention which sources (by title) contain the information you're using.
    
    FORMAT YOUR ANSWER LIKE THIS:
    [Provide your comprehensive answer here, drawing from the context provided]
    
    SOURCES: [List the relevant source titles you used]
    `;
}
