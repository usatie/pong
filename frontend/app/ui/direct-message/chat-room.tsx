"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { chatSocket as socket } from "@/socket";
import type { User } from "@/app/ui/user/card";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";

type PrivateMessage = {
  from: string;
  to: string;
  userName: string;
  content: string;
};

type MessageLog = Array<PrivateMessage>;

const formSchema = z.string().min(1);

function Header({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="px-4 py-2">{children}</div>
      <Separator />
    </>
  );
}

function Content({ messageLog }: { messageLog: MessageLog }) {
  return (
    <ul className="overflow-auto flex-grow flex flex-col gap-2 w-full">
      {messageLog.map((message, i) => {
        return (
          <li
            key={i}
            className="flex flex-col items-start gap-1 text-slate-600 text-sm"
          >
            <a>{message.userName}</a>
            <div className="flex justify-center p-2 shadow mb-2 bg-muted rounded-lg">
              {message.content}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

type TextInputProps = {
  sendMessage: (e: React.SyntheticEvent) => void;
  setMessage: (message: string) => void;
  message: string;
};
function TextInput({ sendMessage, setMessage, message }: TextInputProps) {
  return (
    <form className="flex gap-2" id="chat-content" onSubmit={sendMessage}>
      <Input
        placeholder="Message..."
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        type="text"
      />
      <Button type="submit">Send</Button>
    </form>
  );
}

export default function ChatRoom({
  id,
  oldLog,
  me,
  other,
}: {
  id: string;
  oldLog: MessageLog;
  me: User;
  other: User;
}) {
  const [message, setMessage] = useState("");
  const [messageLog, setMessageLog] = useState<MessageLog>([]);
  const myId = me.id.toString();
  const otherId = other.id.toString();

  useEffect(() => {
    socket.connect(); // no-op if the socket is already connected
    socket.emit("joinDM", myId);
    console.log("emit joinDM");
    if (oldLog.length > 0) {
      setMessageLog(() => [...oldLog]);
    }

    const handleMessageReceived = (newMessageLog: PrivateMessage) => {
      if (newMessageLog.from === otherId || newMessageLog.from === myId) {
        console.log("received message: ", newMessageLog);
        setMessageLog((oldMessageLogs) => [...oldMessageLogs, newMessageLog]);
        console.log(newMessageLog);
      }
    };
    socket.on("sendToUser", handleMessageReceived);

    return () => {
      console.log(`return from useEffect`);
      socket.off("sendToUser", handleMessageReceived);
      console.log("disconnect");
      socket.disconnect();
    };
  }, [myId, otherId, oldLog]);

  const sendMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newMessage = message;
    const result = formSchema.safeParse(newMessage);
    if (result.success) {
      console.log(`privateMassage`, newMessage);
      console.log("name: ", me.name);
      const name = me.name;
      const toId = otherId;
      socket.emit("privateMessage", {
        conversationId: id,
        to: toId,
        userName: name,
        content: newMessage,
      });
      setMessage("");
    }
  };

  // When too many message, Content becomes bigger than viewport height.
  // How can I avoid this?
  // I want to make the height of Content to be the height of the viewport.
  return (
    <div className="border rounded h-full flex flex-col">
      <Header>{other.name}</Header>
      <div className="flex-grow flex-shrink p-4 flex flex-col gap-4 relative">
        <Content messageLog={messageLog} />
        <div className="absolute bottom-4 left-4 right-4">
          <TextInput
            setMessage={setMessage}
            message={message}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}
