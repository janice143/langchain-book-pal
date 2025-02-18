import { RunnableSequence } from '@langchain/core/runnables';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { Ollama } from '@langchain/ollama';
import type { Document } from 'langchain/document';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

const QA_TEMPLATE = `你是一个阅读高手，擅长文章阅读和总结，你在回答用户问题的时候，会准确根据原文回答，结合你的总结能力、关键词提取能力以及问题发散能力，按照模板输出标准化的回答。

<context>
  {context}
</context>

用户提问：{question}

你的模板化回答，基于markdown格式：

## 内容导读
（请提供文档内容的概述或背景信息。总结文档应包括文献、研究材料、案例分析或其他相关的背景信息，旨在帮助读者理解文档的核心主题和结构。）

## 主要内容
	1.	文档概述：（简要介绍文档的背景、目的和目标。）
	2.	关键要点：（列出文档中的核心内容或论点，抓住最重要的信息。）
	3.	分析和总结：（对文档的主要内容进行分析，提炼出关键结论。）

## 关键词（3个关键词）
	•	（提取文档中的核心概念或术语，帮助读者快速了解文章的主题。）
	•	（标明对理解文档最重要的关键词或短语。）

## 思考问题（3个思考问题）
	1.	（该文档的结论或核心观点是什么？）
	2.	（文档中的哪些论点或数据最具说服力？）
	3.	（你认为该文档中有没有值得进一步探讨的领域？）
	4.	（你是否认为该文档中的理论或方法有实际应用的价值？）
`;

const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join(separator);
};

const ollamaModel = () => {
  const model = new Ollama({
    model: 'deepseek-r1:8b', // Default value
    // model: 'llama3', // Default value
    temperature: 0.6,
    maxRetries: 2,
    baseUrl: 'http://127.0.0.1:11434'
    // other params...
  });
  return model;
};

export const makeChain = (retriever: VectorStoreRetriever) => {
  const answerPrompt = ChatPromptTemplate.fromTemplate(QA_TEMPLATE);

  const model = ollamaModel();

  // Retrieve documents based on a query, then format them.
  const retrievalChain = retriever.pipe(combineDocumentsFn as any);
  const contextRetrieverChain = RunnableSequence.from([
    (input) => input.question,
    retrievalChain
  ]);
  // Generate an answer to the standalone question based on the chat history
  // and retrieved documents. Additionally, we return the source documents directly.
  const answerChain = RunnableSequence.from([
    {
      context: contextRetrieverChain,
      question: (input) => input.question
    },
    answerPrompt,
    model,
    new StringOutputParser()
  ]);
  return answerChain;
};
