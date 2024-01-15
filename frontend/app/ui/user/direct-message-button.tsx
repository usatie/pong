"use client";
import { getDirectRoom, createDirectRoom } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DirectMessageButton({ id }: { id: number }) {
  const router = useRouter();
  const onClick = async () => {
    const room = await getDirectRoom(id);
    console.log(room);
    if (room.statusCode === 404) {
      await createDirectRoom(id);
    } else {
      router.push(`/room/${room.id}`);
    }
  };
  return <Button onClick={onClick}>Message</Button>;
}
