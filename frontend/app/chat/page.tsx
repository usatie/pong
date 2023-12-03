"use client";
import { Separator } from "@/components/ui/separator";
import { users, messages } from "./test-data";
import { Sidebar } from "./sidebar";
import MessageArea from "./message-area";

export default function ChatPage() {
  return (
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        <Sidebar users={users} />
        <Separator orientation="vertical" />
        <MessageArea />
      </div>
    </>
  );
}
