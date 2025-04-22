"use client";

import * as React from "react";
import { MessageSquarePlus, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createChatRoom, getChatRooms } from "@/lib/api";

function ChatSidebar({ fileId }: any) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [chat, setChat] = React.useState<any>(null);
  const [newChatTitle, setNewChatTitle] = React.useState("");

  const filteredChatRooms = chat?.filter((room: any) =>
    room.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log(chat, "data");
  React.useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const rooms = await getChatRooms();
        setChat(rooms);
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      }
    };
    fetchChatRooms();
  }, []);

  const handleSubmit = () => {
    try {
      createChatRoom({ title: newChatTitle });
    } catch (error) {}
  };
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="mt-10">
          <div className="px-4 py-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="w-full justify-start gap-2"
                  variant="default"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter chat title..."
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                  />
                  <Button onClick={handleSubmit} className="w-full">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="px-4 py-2">
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-white">
              Recent Chats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-3">
                {filteredChatRooms?.map((room: any) => (
                  <SidebarMenuItem key={room.chat_id}>
                    <SidebarMenuButton asChild>
                      <a
                        href={`/chat/${room.chat_id}`}
                        className="flex flex-col items-start border"
                      >
                        <div className="flex w-full justify-between">
                          <span className="font-medium text-white">
                            {room.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(room.timestamp).toLocaleDateString('en-CA')}
                          </span>
                        </div>
                        <div className="flex w-full justify-between">
                          <span className="text-xs text-muted-foreground truncate max-w-[70%] text-white">
                            {room.lastMessage}
                          </span>
                          {room.unread > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground text-white">
                              {room.unread}
                            </span>
                          )}
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {filteredChatRooms?.length === 0 && (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    No chats found
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/profile" className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      John Doe
                    </span>
                    <span className="text-xs text-muted-foreground text-white">
                      john.doe@example.com
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <div className="flex-1 p-4">
        <SidebarTrigger className="mb-4 md:hidden" />
        <div className="rounded-lg border p-4">
          <p className="text-center text-muted-foreground">
            Select a chat or create a new one
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default ChatSidebar;
