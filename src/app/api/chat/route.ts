import type { Document } from 'langchain/document';
import { makeChain } from '../../../../utils/makechain';
import { OllamaEmbeddings } from '@langchain/ollama';
import { PineconeStore } from '@langchain/pinecone';
import { PINECONE_INDEX_NAME } from '../../../../config/pinecone';
import { pinecone } from '../../../../utils/pinecone-client';

export async function POST(request: Request) {
  const { question } = await request.json();

  if (!question) {
    return new Response('No question in the request', { status: 400 });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME) as any;

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OllamaEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text'
      }
    );
    // Use a callback to get intermediate sources from the middle of the chain
    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });

    const retriever = vectorStore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          }
        }
      ]
    });

    // create chain
    const chain = makeChain(retriever);

    // Ask a question using chat history
    const response = await chain.invoke({
      question: sanitizedQuestion
    });
    console.log('🚀 ~ POST ~ response:', sanitizedQuestion, response);

    const sourceDocuments = await documentPromise;

    return Response.json({ text: response, sourceDocuments }, { status: 200 });
    // return Response.json({ text: '11' }, { status: 200 });
  } catch (error: any) {
    console.log('error', error);
    return Response.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
