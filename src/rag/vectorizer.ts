import { generateEmbeddings } from "../config/llm";
import { upsertVectors } from "../db/pineconeClient";
import { CleanedArticle } from "../models/article";
import { chunkText } from "../utils/chunker";
import { logger } from "../utils/logger";

export async function storeArticle(article: CleanedArticle): Promise<void> {
    try {
        logger.info(`Storing article: ${article.title}`);

        const articleId = Buffer.from(article.url).toString("base64");
        const chunks = await chunkText(article);

        logger.info(
            `Storing ${chunks.length} chunks for article: ${article.title}`
        );

        const vectors = await Promise.all(
            chunks.map(async (chunkText, index) => {
                const embedding = await generateEmbeddings(chunkText.text);

                return {
                    id: `${articleId}_chunk_${index}`,
                    values: embedding,
                    metadata: {
                        articleId,
                        title: article.title,
                        url: article.url,
                        source: article.source,
                        date: article.date,
                        chunkIndex: index,
                        totalChunks: chunks.length,
                        chunkContent: chunkText.text.slice(0, 500),
                    },
                };
            })
        );

        await upsertVectors(vectors);

        logger.info(`Stored article: ${article.title}`);
    } catch (error) {
        logger.error(`Error storing article: ${error}`);
        throw new Error(`Error storing article: ${error}`);
    }
}
