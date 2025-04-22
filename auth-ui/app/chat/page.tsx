"use client";

import React from "react";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Menu, MoreVertical, Paperclip, Smile } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fetchPdf, getConversationByPdfId, sendQuery } from "@/lib/api";
import RobotLoading from "@/components/robot-loading";
import { set } from "date-fns";
import ChatSidebar from "@/components/Sidebar";
import UploadFile from "@/components/Upload";

type Message = {
  id: string;
  response: string;
  role: "user" | "assistant";
  timestamp: string;
};

export default function page() {
  const [oldMessages, setOldMessages] = useState<any>(null);
  const [fileId, setFileId] = React.useState<string | null>(null);
  React.useEffect(() => {
    const storedFileId = localStorage.getItem("fileId");
    setFileId(storedFileId);
  }, []);
  const [messages, setMessages] = useState<any>([
    {
      id: "1",
      response: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [pdfUrl, setPdfUrl] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function addNewMessage(
    input: string,
    setMessages: React.Dispatch<React.SetStateAction<any>>
  ) {
    const newMessage = {
      query: input,
      response: null,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev: any) => [...prev, newMessage]);
  }

  // useEffect(() => {
  //   const fetchPdfData = async () => {
  //     const pdfUrl = await fetchPdf();
  //     if (pdfUrl) {
  //       setPdfUrl(pdfUrl);
  //     }
  //     setLoading(false);
  //   };
  //   const fetchPdfConversation = async () => {
  //     const convoId = await getConversationByPdfId();
  //     if (convoId) {
  //       setOldMessages(convoId);
  //       for (const i of convoId) {
  //         setMessages((prev: any) => [...prev, i]);
  //       }
  //     }
  //   };

  //   fetchPdfData();
  //   fetchPdfConversation();
  // }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addNewMessage(input, setMessages);
    if (!input.trim()) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timestamp = `${formattedHours}:${formattedMinutes} ${ampm}`;

    const userMessage: Message = {
      id: Date.now().toString(),
      response: input,
      role: "user",
      timestamp,
    };

    setMessages((prev: any) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendQuery(input);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        response: response.response || "No response from AI.",
        role: "assistant",
        timestamp,
      };

      setMessages((prev: any) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        response: "Oops! Something went wrong while fetching the response.",
        role: "assistant",
        timestamp,
      };

      setMessages((prev: any) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-transparent">
      {/* Chat header */}
      <div className="w-full md:w-[0.2]">
        <ChatSidebar fileId={fileId} />
      </div>
      {fileId ? (
        <div>
          <div className="w-full md:w-[0.4] flex flex-col gap-4 h-full">
            <Card className="flex-1 h-full">
              {loading ? (
                <RobotLoading text="pdf is loading" />
              ) : (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                />
              )}
            </Card>
          </div>
          <div className=" flex flex-col w-full md:w-[0.4] h-full">
            <div className="flex-[0.95] overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message: any, index: number) => (
                  <React.Fragment key={index}>
                    {/* User Query Bubble */}
                    {message.query && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-end mb-4"
                      >
                        <div className="flex max-w-[80%] flex-row-reverse">
                          <div className="flex-shrink-0 ml-3 mt-1">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shadow-sm">
                              <span className="text-white text-xs font-bold">
                                You
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-black text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm font-medium">
                              {message.query}
                            </div>
                            <span className="text-xs mt-1 text-gray-500 text-right mr-1">
                              {message.timestamp}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* AI Response Bubble */}
                    {message.response && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-start mb-4"
                      >
                        <div className="flex max-w-[80%] flex-row">
                          <div className="flex-shrink-0 mr-3 mt-1">
                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-sm">
                              <span className="text-white text-xs font-bold">
                                AI
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                              {message.response}
                            </div>
                            <span className="text-xs mt-1 text-gray-500 ml-1">
                              {message.timestamp}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>

              {/* Enhanced typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start mb-4"
                >
                  <div className="flex max-w-[80%]">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <motion.div
                        className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-sm"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(0, 0, 0, 0.7)",
                            "0 0 0 3px rgba(0, 0, 0, 0.2)",
                            "0 0 0 0 rgba(0, 0, 0, 0.7)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                        }}
                      >
                        <span className="text-white text-xs font-bold">AI</span>
                      </motion.div>
                    </div>

                    <div className="flex flex-col">
                      <motion.div className="rounded-2xl px-4 py-3 bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm relative overflow-hidden">
                        {/* Background pulse effect */}
                        <motion.div
                          className="absolute inset-0 bg-black opacity-0"
                          animate={{ opacity: [0, 0.02, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "loop",
                          }}
                        />

                        <div className="flex space-x-2 items-center h-5 relative z-10">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2.5 h-2.5 rounded-full bg-black"
                              animate={{
                                y: [0, -5, 0],
                                scale: [0.8, 1.2, 0.8],
                                backgroundColor: [
                                  "#000000",
                                  "#333333",
                                  "#000000",
                                ],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "loop",
                                ease: "easeInOut",
                                delay: i * 0.2,
                              }}
                              style={{
                                filter: "drop-shadow(0 0 1px rgba(0,0,0,0.5))",
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            {/* Input area */}
            <div className="border-t border-gray-200 bg-white p-3">
              <form
                onSubmit={handleSubmit}
                className="flex items-center space-x-2 max-w-4xl mx-auto"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  ></button>
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-2.5 rounded-full ${
                    !input.trim() || isLoading
                      ? "bg-gray-200 text-gray-500"
                      : "bg-black text-white hover:bg-gray-800"
                  } transition-colors shadow-sm`}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>{" "}
          </div>
        </div>
      ) : (
        <UploadFile />
      )}
    </div>
  );
}
