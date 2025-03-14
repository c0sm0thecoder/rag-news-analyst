import Mercury from "@postlight/mercury-parser";
import { NewsMessage } from "../models/message";
import { cleanContent } from "./content-cleaner.";
import { storeArticle } from "../rag/vectorizer";

export async function processNewLink(newsMessage: NewsMessage): Promise<void> {
    try {
        const extracted = await extractContent(newsMessage.url);

        const cleaned = await cleanContent(
            { title: extracted.title, content: extracted.content },
            newsMessage.url,
            newsMessage.source
        );

        await storeArticle(cleaned);
    } catch (err) {
        throw err;
    }
}

export async function extractContent(
    url: string
): Promise<{ title: string; content: string }> {
    const result = await Mercury.parse(url);
    return { title: result.title, content: result.content };
}
