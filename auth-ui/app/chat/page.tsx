// import { useEffect, useState } from "react";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Card } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import { Bot, Send } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// const fetchChatHistory = async (pdfId) => {
//   const res = await fetch(`http://127.0.0.1:8000/get-chat-history/${pdfId}`);
//   return res.json();
// };

// const sendMessage = async ({ pdfId, query } : any) => {
//   const url = `http://127.0.0.1:8000/chat/?pdf_id=${encodeURIComponent(pdfId)}&query=${encodeURIComponent(query)}`;
  
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//   });

//   return res.json();
// };



// const page = ({ pdfUrl, pdfId }: any) => {
//   // const queryClient = useQueryClient();
//   const [messages, setMessages] = useState<any>([]);
//   const [input, setInput] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);


//   // Fetch chat history
//   const { data: chatHistory, isLoading: isHistoryLoading }: any = useQuery({
//     queryKey: ["chatHistory", pdfId],
//     queryFn: () => fetchChatHistory(pdfId),
//     onSuccess: (data: any) => setMessages(data || []),
//   });
//   console.log(chatHistory,"chatHistory")
//   console.log(isHistoryLoading);
//   // Send chat message
//   const mutation = useMutation({
//     mutationFn: ({ query }: any) => sendMessage({ pdfId, query }),
//     onMutate: async ({ query }) => {
//       setMessages((prev: any) => [
//         ...prev,
//         { id: Date.now(), role: "user", content: query },
//       ]);
//       setInput("");
//       setIsGenerating(true);
//     },
//     onSuccess: async (data) => {
//       await simulateTyping(data.answer);
//       setIsGenerating(false);
//     },
//   });

//   const simulateTyping = async (text) => {
//     let generatedText = "";
//     for (const word of text.split(" ")) {
//       generatedText += word + " ";
//       setMessages((prev) => [
//         ...prev.slice(0, -1),
//         { ...prev[prev.length - 1], content: generatedText },
//       ]);
//       await new Promise((resolve) => setTimeout(resolve, 50));
//     }
//   };

//   const handleChatSubmit = (e) => {
//     e.preventDefault();
//     if (input.trim()) {
//       setMessages((prev) => [
//         ...prev,
//         { id: Date.now(), role: "assistant", content: "" },
//       ]);
//       mutation.mutate({ query: input });
//     }
//   };

//   return (
//     <div className="flex flex-col md:flex-row h-screen p-4 gap-4">
//       <div className="w-full md:w-1/2 flex flex-col gap-4">
//         <Card className="flex-1 flex flex-col overflow-hidden">
//           {pdfUrl && (
//             <iframe
//               src={pdfUrl}
//               className="w-full h-full border-0"
//               title="PDF Viewer"
//             />
//           )}
//         </Card>
//       </div>

//       <div className="w-full md:w-1/2 flex flex-col gap-4">
//         <Card className="flex-1 flex flex-col p-4 overflow-hidden">
//           <div className="flex-1 overflow-y-auto mb-4">
//             {isHistoryLoading ? (
//               <p className="text-sm text-muted-foreground">
//                 Loading chat history...
//               </p>
//             ) : (
//               chatHistory?.chat_history?.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`flex flex-col gap-4 mb-4 p-4 rounded-lg ${
//                     message.role === "user"
//                       ? "bg-primary text-primary-foreground ml-8"
//                       : "bg-muted mr-8"
//                   }`}
//                 >
//                   <p className="whitespace-pre-wrap">{message.query}</p>
//                   {/* {message.role === "assistant" && ( */}
//                     <div className="flex items-center mb-2">
//                       <Bot className="h-5 w-5 mr-2" />
//                       <span className="font-medium">AI Assistant</span>
//                       <p>{message?.answer}</p>
//                     </div>
//                   {/* )} */}
//                 </div>
//               ))
//             )}
//           </div>

//           <Separator className="my-2" />

//           <form onSubmit={handleChatSubmit} className="flex gap-2">
//             <Input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Ask a question about the PDF..."
//               className="flex-1"
//               disabled={mutation.isLoading}
//             />
//             <Button
//               type="submit"
//               disabled={!input.trim() || mutation.isLoading}
//             >
//               <Send className="h-4 w-4" />
//             </Button>
//           </form>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default page;
import React from 'react'

const page = () => {
  return (
    <div>
      
    </div>
  )
}

export default page
