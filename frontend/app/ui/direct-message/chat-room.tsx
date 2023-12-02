"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { chatSocket as socket } from "@/socket";
import type { User } from "@/app/ui/user/card";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";

type DM = {
  from: string;
  to: string;
  userName: string;
  text: string;
};

type MessageLog = Array<DM>;

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
              {message.text}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TextInput({ sendMessage, setMessage, message }: any) {
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
  yourself,
  other,
}: {
  yourself: User;
  other: User;
}) {
  const [message, setMessage] = useState("");
  const [messageLog, setMessageLog] = useState<MessageLog>([]);
  const yourselfNameId = yourself.name! + yourself.id!;
  const otherNameId = other.name! + other.id!;

  useEffect(() => {
    const handleMessageReceived = (newMessageLog: DM) => {
      if (
        newMessageLog.from === otherNameId ||
        newMessageLog.from === yourselfNameId
      ) {
        console.log("received message: ", newMessageLog);
        setMessageLog((oldMessageLogs) => [...oldMessageLogs, newMessageLog]);
        console.log(messageLog);
      }
    };
    socket.on("sendToUser", handleMessageReceived);
    return () => {
      console.log(`return from useEffect`);
      socket.off("sendToUser", handleMessageReceived);
    };
  }, [messageLog, yourselfNameId, otherNameId]);

  useEffect(() => {
    socket.connect(); // no-op if the socket is already connected
    socket.emit("joinDM", yourselfNameId);
    console.log("emit joinDM");

    return () => {
      socket.emit("leaveDM", yourselfNameId);
      console.log("emit leaveDM");
      console.log("disconnect");
      socket.disconnect();
    };
  }, [yourselfNameId]);

  const sendMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newMessage = message;
    const result = formSchema.safeParse(newMessage);
    if (result.success) {
      console.log(`privateMassage`, newMessage);
      console.log("name: ", yourself.name);
      const name = yourself.name;
      const fromName = yourselfNameId;
      const toName = otherNameId;
      socket.emit("privateMessage", {
        from: fromName,
        to: toName,
        userName: name,
        text: newMessage,
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
