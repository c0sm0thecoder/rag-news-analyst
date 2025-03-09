import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CleanedArticle } from "../models/article";
import { logger } from "./logger";

export interface DocumentChunk {
    text: string;
    metadata: {
        source: string;
        title: string;
        url: string;
        date: string;
        chunkIndex: number;
    };
}

export async function chunkText(
    article: CleanedArticle
): Promise<DocumentChunk[]> {
    try {
        logger.info(`Chunking text for article: ${article.title}`);
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const fullText = `${article.title}\n\n${article.content}`;
        const chunks = await splitter.splitText(fullText);

        const documentChunks = chunks.map((chunk, index) => {
            return {
                text: chunk,
                metadata: {
                    source: article.source,
                    title: article.title,
                    url: article.url,
                    date: article.date,
                    chunkIndex: index,
                },
            };
        });

        logger.info(`Chunked text for article: ${article.title}`);
        return documentChunks;
    } catch (error) {
        logger.error(`Error chunking text: ${error}`);
        throw new Error(`Error chunking text: ${error}`);
    }
}
