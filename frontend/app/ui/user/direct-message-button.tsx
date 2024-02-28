"use client";
import { createDirectRoom, getDirectRoom } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const showErrorToast = () => {
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
        await createDirectRoom(id);
      } else {
        router.push(`/room/${room.id}`);
      }
    } catch (e) {
      showErrorToast();
    }
  };
  return <Button onClick={createOrRedirectDirectRoom}>Message</Button>;
}
