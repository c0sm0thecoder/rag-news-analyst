# RAG News Analysis

A smart system that ingests news articles, extracts and stores their content, and lets you ask questions about them using natural language. Think of it as your personal news assistant that reads and remembers articles so you can have conversations about them later.

## Tech Stack

-   Google Gemini AI: The brains of the operation - helps summarize articles, generate embeddings, and answer your questions.
-   Pinecone: A specialized vector database that stores and searches through those article "fingerprints".
-   Kafka: A message system that handles the incoming stream of news articles.
-   GraphQL: The way to query the API.
-   Express: The web server that handles all requests.
-   Mercury Parser: The helper that extracts clean article content from messy web pages.
-   TypeScript: The language used for building the codebase
-   Docker: Packages everything into containers so it runs the same everywhere

## How It Works

`1. News URL → 2. Content Extraction → 3. AI Cleaning → 4. Vector Storage → 5. Query Interface`

1. The system receives a news article URL (via Kafka or a url in the query)
2. Mercury Parser extracts the meaningful content
3. Gemini AI cleans and structures the article
4. The article is split into chunks, converted to embeddings, and stored in Pinecone
5. You ask questions through a GraphQL API and get answers based on the stored articles

## Getting Started

Prerequisites

-   Node.js 18+
-   Docker and Docker Compose
-   A Pinecone account (free tier works fine)
-   A Google AI (Gemini) API key

## Environment Setup

1. Clone the repo:

```bash
git clone https://github.com/yourusername/rag_news_analysis.git
cd rag_news_analysis
```

2. Create a .env file with:

```bash
# App settings
PORT=8080
NODE_ENV=development

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Kafka
KAFKA_CLIENT_ID=rag-news-consumer
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC_NAME=news-topic
KAFKA_GROUP_ID_PREFIX=news-consumer
KAFKA_SSL=false
KAFKA_SASL=false
```

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. The GraphQL playground will be available at http://localhost:8080/graphql

## Running with Docker

This is the easiest way to get everything up and running:

```bash
docker compose up
```

This will start:

-   Zookeeper
-   Kafka for message streaming
-   The RAG News Analysis application

## Using the Application

You can add articles three ways:

1. Direct API call:

```
mutation {
  processUrl(
    url: "https://example.com/news-article",
    source: "Example News"
  )
}
```

2. Send to Kafka topic:
   Send a message to the news-topic in format: SourceName\thttp://article-url.com
3. Embed the link inside your query:

```
query {
  askQuestion(query: "What were the key developments in AI last month? https://news_resource.com/link-to-the-article") {
    answer
    sources {
      title
      url
      source
      date
    }
  }
}
```

## Asking Questions

Use the GraphQL API to ask questions about the stored articles:

```
query {
  askQuestion(query: "What were the key developments in AI last month?") {
    answer
    sources {
      title
      url
      source
      date
    }
  }
}
```

## How to Debug

-   Check the logs: docker logs rag-news-app
-   Look at the combined log file: cat combined.log
-   Error logs: cat error.log

## Project structure

-   api/ - GraphQL API definitions
-   config/ - Configuration for services like Kafka, Pinecone, and Gemini
-   db/ - Database interactions (Pinecone)
-   ingest/ - Article ingestion pipeline
-   models/ - TypeScript interfaces
-   rag/ - RAG implementation (retrieval, vector storage, answer generation)
-   utils/ - Utility functions
