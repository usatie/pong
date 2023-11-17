'use client';

import { Card, CardHeader, CardContent, CardFooter, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatHome from '@/app/ui/room/chat-room';
import { useState, useEffect } from "react";
import { socket } from '@/socket';

type Chat = {
  text: string;
};

type MessageLog = Array<Message>

export default function ChatHome() {
  const [message, setMessage] = useState("");
  const [messageLog, setMessageLog] = useState<Chat>([
    {
      text: "example message logs",
    },
    {
      text: "Hello world",
    },
    {
      text: "hoge hoge",
    }
  ]);


  useEffect(() => {
    const newMessageReceived = (e) => {
      console.log(`received message: `, e);
      setMessageLog((oldMessageLog) => [...oldMessageLog, { text: e }]);
      const newMessageLog = messageLog;
      console.log(messageLog);
    };
    socket.on("sendToClient", newMessageReceived);
    return () => {
      console.log(`return from useEffect`);
      socket.off("sendToClient", newMessageReceived);
    };
  }, [messageLog]);

  useEffect(() => {
    socket.connect(); // no-op if the socket is already connected
    return () => {
      console.log('disconnect');
      socket.disconnect();
    };
  }, []);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    const newMessage = message;
    console.log(`sendMessage`, newMessage);
    socket.emit("newMessage", newMessage);
    setMessage("");
//    setMessageLog((oldMessageLog) => [...oldMessageLog, { text: newMessage }]);
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-[800px] grid grid-rows-[min-content_1fr_min-content]">
        <CardHeader>
          <CardTitle>Chat room</CardTitle>
          <CardDescription>Experimental chat room</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full space-y-1 pr-3">
            <div className="flex gap-3 text-slate-600 text-sm">
              <ul>
              {messageLog.map((message, i) => {
                return (<div key={i} className="flex gap-3 text-slate-600 text-sm"> <li>{message.text}</li>

                </div>
                );
              })}
              </ul>
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form  className="space-x-2 w-full flex gap-2"
            id="chat-content"
            onSubmit={sendMessage}
          >
            <Input placeholder="Message..." name="message" value={message} onChange={(e) => setMessage(e.target.value)} type="text" />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

//async function getRoom(id: number) {
//  const res = await fetch(`${process.env.API_URL}/room/${id}`, {
//    cache: "no-cache",
//  });
//  const room = await res.json();
//  return room;
//}
//
//export default async function getRoomInfo({
//  params: { id },
//}: {
//  params: { id: number };
//}) {
//  const room = await getRoom(id);
//  return (
//    <div>
//      <h1>
//        <b>Room info</b>
//      </h1>
//      <p>
//        room ID: {room.id} <br />
//        room name: {room.name}
//      </p>
//    </div>
//  );
//}
