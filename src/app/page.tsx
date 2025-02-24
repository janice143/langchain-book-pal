'use client';

import LoadingDots from '@/components/LoadingDots';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Card, CardFooter } from '@/components/ui/card';
import styles from '@/styles/Home.module.css';
import { Document } from 'langchain/document';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
};

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message:
          'aaaaa Halalalalalaalli, what would you like to learn about this document?',
        type: 'userMessage'
      },
      {
        message: 'Hi, what would you like to learn about this document?',
        type: 'apiMessage'
      }
    ],
    history: []
  });

  const { messages } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question
        }
      ]
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question
        })
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments
            }
          ],
          history: [...state.history, [question, data.text]]
        }));
      }
      console.log('messageState', messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && e.shiftKey) {
      handleSubmit(encodeURI);
    } else if (e.key === 'Enter' && query) {
      e.preventDefault();
    } else if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="flex justify-center w-full px-60 pt-8 h-full">
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex-1">
            <div className="">
              {messages.map((message, index) => {
                return (
                  <>
                    <div
                      className="flex flex-col space-y-4"
                      ref={messageListRef}
                    >
                      {/* loading && index === messages.length - 1 */}
                      {message.type === 'userMessage' ? (
                        <div className="bg-gray-100 text-gray-800 p-4 rounded-lg shadow-md max-w-md self-end">
                          <ReactMarkdown
                            components={{
                              a: ({ ...props }) => (
                                <a
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              )
                            }}
                          >
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="my-6">
                          <ReactMarkdown
                            components={{
                              a: ({ ...props }) => (
                                <a
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              )
                            }}
                          >
                            {message.message}
                          </ReactMarkdown>
                          {message.sourceDocs && (
                            <div key={`sourceDocsAccordion-${index}`}>
                              <Accordion
                                type="single"
                                collapsible
                                className="flex-col"
                              >
                                {message.sourceDocs.map((doc, index) => (
                                  <div key={`messageSourceDocs-${index}`}>
                                    <AccordionItem value={`item-${index}`}>
                                      <AccordionTrigger>
                                        <h3>Source {index + 1}</h3>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <ReactMarkdown
                                          components={{
                                            a: ({ ...props }) => (
                                              <a
                                                {...props}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              />
                                            )
                                          }}
                                        >
                                          {doc.pageContent}
                                        </ReactMarkdown>
                                        <p className="mt-2">
                                          <b>Source:</b> {doc.metadata.source}
                                        </p>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </div>
                                ))}
                              </Accordion>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center mt-2 w-full">
          <div className="flex items-center mt-2 w-full">
            <Textarea
              className="align-middle"
              ref={textAreaRef}
              placeholder={
                loading ? 'Waiting for response...' : '这篇文章主要讲什么'
              }
              disabled={loading}
              onKeyDown={handleEnter}
              autoFocus={false}
              rows={1}
              maxLength={512}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading ? (
              <Button className="ml-2" variant="secondary">
                <LoadingDots color="#000" />
              </Button>
            ) : (
              // Send icon SVG in input field
              <Button className="ml-2" onClick={handleSubmit}>
                <svg
                  viewBox="0 0 20 20"
                  className={styles.svgicon}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              </Button>
            )}
          </div>
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
