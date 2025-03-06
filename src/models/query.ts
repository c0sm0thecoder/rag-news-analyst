export interface QueryInput {
    query: string;
}

export interface QueryResponse {
    answer: string;
    resources: Source[];
}

export interface Source {
    title: string;
    url: string;
    date: string;
    source: string;
}
