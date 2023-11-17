import * as React from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import JoinRoomForm from "./JoinRoomForm";
import { v4 } from "uuid";

export default async function CardWithForm() {
  const roomId = v4();
  return (
    <div className="flex flex-col content-between gap-5 mx-auto">
      <Button className="inline max-w-sm">
        <Link href={`/pong/${roomId}`} className="block">
          Create a new room
        </Link>
      </Button>
      <JoinRoomForm />
    </div>
  );
}
