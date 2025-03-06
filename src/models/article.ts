export interface Article {
    id?: number;
    title: string;
    content: string;
    url: string;
    date: string;
    source: string;
    vector?: number[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ArticleInput {
    url: string;
}

export interface CleanedArticle {
    title: string;
    content: string;
    url: string;
    date: string;
    source: string;
    vector?: number[];
}
