"use client";
import { UserOnRoomEntity } from "@/app/lib/dtos";

interface Props {
  me: UserOnRoomEntity;
  users: UserOnRoomEntity[];
}

export const DmTitle = ({ me, users }: Props) => {
  const otherUser = users.find((user) => user.user.id !== me.user.id);

  return (
    <>
      <div className="flex justify-between items-center h-10 border-b-2 mb-2">
        <a className="text-md font-semibold">{otherUser?.user.name}</a>
      </div>
    </>
  );
};
