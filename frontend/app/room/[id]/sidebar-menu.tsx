"use client";

import { leaveRoom } from "@/app/lib/actions";
import { PublicUserEntity, RoomEntity, UserOnRoomEntity } from "@/app/lib/dtos";
import BanModal from "@/app/ui/room/ban-modal";
import InviteModal from "@/app/ui/room/invite-modal";
import SettingModal from "@/app/ui/room/setting-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ban, ChevronDown, LogOut, Settings, UserPlus } from "lucide-react";
import { useState } from "react";

interface ItemProps {
  title: string;
  variant?: "destructive";
  onSelect?: (event: Event) => void;
  Icon: any;
  Modal?: any;
}

function Item({ title, variant, Icon, onSelect, Modal }: ItemProps) {
  const titleColor =
    variant === "destructive" ? "text-primary" : "text-foreground";
  return (
    <DropdownMenuItem
      className={`${titleColor} px-3 py-2 flex justify-between`}
      onSelect={onSelect}
    >
      <a className={`text-sm cursor-pointer`}>{title}</a>
      <Icon className="h-4 w-4" />
      {Modal && <Modal />}
    </DropdownMenuItem>
  );
}

interface Props {
  room: RoomEntity;
  me: UserOnRoomEntity;
  allUsers: PublicUserEntity[];
  usersOnRoom: UserOnRoomEntity[];
  bannedUsers: PublicUserEntity[];
}

export const SidebarMenu = ({
  room,
  me,
  allUsers,
  usersOnRoom,
  bannedUsers,
}: Props) => {
  const isAdmin = me.role === "OWNER" || me.role === "ADMINISTRATOR";
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const leave = () => {
    leaveRoom(room.id);
  };
  const openInvite = () => {
    setIsInviteOpen(true);
  };
  const openSetting = () => {
    setIsSettingOpen(true);
  };
  const openBan = () => {
    setIsBanOpen(true);
  };

  const members = usersOnRoom.map((member) => member.user);

  return (
    <>
      {isAdmin && (
        <>
          <SettingModal
            open={isSettingOpen}
            setOpen={setIsSettingOpen}
            room={room}
          />
          <BanModal
            open={isBanOpen}
            setOpen={setIsBanOpen}
            roomId={room.id}
            me={me}
            allUsers={allUsers}
            bannedUsers={bannedUsers}
          />
          <InviteModal
            open={isInviteOpen}
            setOpen={setIsInviteOpen}
            room={room}
            me={me}
            members={members}
            allUsers={allUsers}
            bannedUsers={bannedUsers}
          />
        </>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-between items-center h-10 border-b-2 mb-2 hover:bg-secondary cursor-pointer">
            <a className="text-md font-semibold">{room.name}</a>
            <ChevronDown className="h-5 w-5" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {isAdmin && (
            <>
              <Item title="Add User" Icon={UserPlus} onSelect={openInvite} />
              <Item title="Setting" Icon={Settings} onSelect={openSetting} />
              <Item title="Ban User" Icon={Ban} onSelect={openBan} />
            </>
          )}
          <Item
            title="Leave"
            variant="destructive"
            Icon={LogOut}
            onSelect={leave}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
