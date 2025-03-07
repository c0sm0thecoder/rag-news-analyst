import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { getEnvironmentVariables } from "./environment";

let genAI: GoogleGenerativeAI;
const MODEL_NAME = "gemini-2.0-flash";

export function initGemini(): GoogleGenerativeAI {
    const env = getEnvironmentVariables();
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    return genAI;
}

export function getGeminiModel(): GenerativeModel {
    if (!genAI) {
        initGemini();
    }
    return genAI.getGenerativeModel({ model: MODEL_NAME });
}

export async function generateEmbeddings(text: string): Promise<number[]> {
    if (!genAI) {
        initGemini();
    }
    const embeddingModel = genAI.getGenerativeModel({
        model: "text-embedding-004",
    });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}
