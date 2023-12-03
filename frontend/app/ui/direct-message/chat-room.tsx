"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { HStack, Stack } from "@/app/ui/layout/stack";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { chatSocket as socket } from "@/socket";
import type { User } from "@/app/ui/user/card";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type PrivateMessage = {
  from: string;
  to: string;
  userName: string;
  content: string;
};

type MessageLog = Array<PrivateMessage>;

const formSchema = z.string().min(1);

function AvatarSkeleton() {
  return <Skeleton className="flex-none rounded-full h-10 w-10" />;
}

function SmallAvatarSkeleton() {
  return <Skeleton className="flex-none rounded-full h-6 w-6" />;
}

function MessageSkeleton() {
  return (
    <div className="flex gap-4">
      <AvatarSkeleton />
      <div className="flex-grow flex flex-col justify-between">
        <Skeleton className="max-w-md h-1/3" />
        <Skeleton className="max-w-lg h-1/2" />
      </div>
    </div>
  );
}

//function ChatMessage({ message }: { message: Message }) {
//  return (
//    <HStack spacing={4} className="hover:opacity-60">
//      <AvatarSkeleton />
//      <Stack>
//        <HStack spacing={2}>
//          <div className="text-xs">{message.userName}</div>
//          <div className="text-xs text-muted-foreground">
//            {message.created_at}
//          </div>
//        </HStack>
//        <div className="text-sm text-muted-foreground">{message.text}</div>
//      </Stack>
//    </HStack>
//  );
//}
//function SimpleMessage({ message }: { message: Message }) {
//  const created_at_hhmm = message.created_at.split(" ")[1].slice(0, 5);
//  return (
//    <HStack spacing={4} className="group hover:opacity-60 mt-0">
//      <div className="group-hover:text-muted-foreground flex-none text-background text-xs w-10 text-center">
//        {created_at_hhmm}
//      </div>
//      <div className="text-sm text-muted-foreground">{message.text}</div>
//    </HStack>
//  );
//}
//
//function MessageBlock({ messages }: { messages: Message[] }) {
//  return (
//    <Stack spacing={1}>
//      {<ChatMessage message={messages[0]} />}
//      {messages.slice(1).map((msg) => (
//        <SimpleMessage message={msg} key={msg.id} />
//      ))}
//    </Stack>
//  );
//}

function Sidebar({ users }: { users: User[] }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const router = useRouter();

  const handleOnClick = (user: User) => {
    router.push(`/direct-message/${user.id}`);
  };

  const blockUser = (user: User) => {
    socket.emit("block", user.id);
    setIsBlocked(true);
  };

  const unblockUser = (user: User) => {
    socket.emit("unblock", user.id);
    setIsBlocked(false);
  };
  return (
    <div className="overflow-y-auto shrink-0 basis-36 flex-grow pb-4">
      <Stack spacing={2}>
        {users.map((user) => (
          <ContextMenu key={user.id}>
            <ContextMenuTrigger>
              <button
                onClick={() => handleOnClick(user)}
                className="flex gap-2 items-center group hover:opacity-60"
              >
                <SmallAvatarSkeleton />
                <a className="text-muted-foreground text-sm whitespace-nowrap group-hover:text-primary">
                  {/* if name is long, trim and append "..." */}
                  {user.name.length > 15
                    ? user.name.slice(0, 15) + "..."
                    : user.name}
                </a>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-56">
              <ContextMenuItem inset>Go profile</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem inset disabled={isBlocked}>
                <button onClick={() => blockUser(user)}>Block</button>
              </ContextMenuItem>
              <ContextMenuItem inset disabled={!isBlocked}>
                <button onClick={() => unblockUser(user)}>Unblock</button>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </Stack>
    </div>
  );
}

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
    <form
      className="flex-grow flex gap-4"
      id="chat-content"
      onSubmit={sendMessage}
    >
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
  users,
}: {
  id: string;
  oldLog: MessageLog;
  me: User;
  other: User;
  users: Array<User>;
}) {
  //  let prev_user_id: number | undefined;
  //  let block: MessageLog = [];
  //  let blocks: MessageLog[] = [];
  //  for (const msg of oldLog) {
  //    if (prev_user_id === parseInt(msg.from)) {
  //      block.push(msg);
  //    } else {
  //      if (block.length > 0) {
  //        blocks.push(block);
  //      }
  //      block = [msg];
  //    }
  //    prev_user_id = parseInt(msg.from);
  //  }
  //  if (block.length > 0) {
  //    blocks.push(block);
  //  }
  const [message, setMessage] = useState("");
  const [messageLog, setMessageLog] = useState<MessageLog>([]);
  const contentRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
      setIsScrolledToBottom(true);
    }
  }, []);
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
      const fromId = myId;
      const toId = otherId;
      socket.emit("privateMessage", {
        conversationId: id,
        from: fromId,
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
    <>
      <div className="overflow-auto flex-grow flex gap-4 pb-4">
        {/* Side bar */}
        <Sidebar users={users} />
        <Separator orientation="vertical" />
        {/* Chat */}
        <div className="flex-grow w-full flex flex-col">
          <Header>{other.name}</Header>
          {/* Skeleton*/}
          <div className={`flex-grow ${isScrolledToBottom ? "hidden" : ""}`}>
            <Stack spacing={4}>
              <MessageSkeleton />
              <MessageSkeleton />
            </Stack>
          </div>
          {/* Messages */}
          <div
            ref={contentRef}
            className={`overflow-auto flex-grow pb-4 ${
              isScrolledToBottom ? "" : "invisible"
            }`}
          >
            <Stack spacing={4}>
              <Content messageLog={messageLog} />
            </Stack>
          </div>
          <div className="flex gap-4">
            <TextInput
              setMessage={setMessage}
              message={message}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
