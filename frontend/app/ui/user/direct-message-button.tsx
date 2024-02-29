"use client";
import { createDirectRoom, getDirectRoom } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const showCreateDirectRoomErrorToast = () => {
  toast({
    title: "Error",
    description: "Failed to create direct message room",
  });
};

const showGetDirectRoomErrorToast = () => {
  toast({
    title: "Error",
    description: "Something went wrong. Please try again later.",
  });
};

export default function DirectMessageButton({ id }: { id: number }) {
  const router = useRouter();
  const createOrRedirectDirectRoom = async () => {
    try {
      const room = await getDirectRoom(id);
      if (room.statusCode === 404) {
        const result = await createDirectRoom(id);
        if (result.error) {
          showCreateDirectRoomErrorToast();
        }
      } else {
        router.push(`/room/${room.id}`);
      }
    } catch (e) {
      showGetDirectRoomErrorToast();
    }
  };
  return <Button onClick={createOrRedirectDirectRoom}>Message</Button>;
}
