"use client";

import { leaveRoom } from "@/app/lib/actions";
import {
  AccessLevel,
  PublicUserEntity,
  UserOnRoomEntity,
} from "@/app/lib/dtos";
import { useModal } from "@/app/lib/hooks/use-modal-store";
import { BanModal } from "@/app/ui/room/ban-modal";
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

export const SidebarMenu = ({
  roomId,
  roomName,
  accessLevel,
  me,
  allUsers,
  usersOnRoom,
  bannedUsers,
}: {
  roomId: number;
  roomName: string;
  accessLevel: AccessLevel;
  me: UserOnRoomEntity;
  allUsers: PublicUserEntity[];
  usersOnRoom: UserOnRoomEntity[];
  bannedUsers: PublicUserEntity[];
}) => {
  const { onOpen } = useModal();

  const isAdmin = me.role === "OWNER" || me.role === "ADMINISTRATOR";
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const leave = () => {
    leaveRoom(roomId);
  };
  const openSetting = () => {
    setIsSettingOpen(true);
  };

  const members = usersOnRoom.map((member) => member.user);

  return (
    <>
      <SettingModal
        open={isSettingOpen}
        setOpen={setIsSettingOpen}
        roomId={roomId}
        roomName={roomName}
        accessLevel={accessLevel}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-between items-center h-10 border-b-2 mb-2 hover:bg-secondary cursor-pointer">
            <a className="text-md font-semibold">{roomName}</a>
            <ChevronDown className="h-5 w-5" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Item title="Add User" Icon={UserPlus} />
          {isAdmin && (
            <>
              <Item title="Setting" Icon={Settings} onSelect={openSetting} />
              <Item
                title="Ban User"
                Icon={Ban}
                Modal={BanModal}
                onSelect={() =>
                  onOpen("ban", { roomId, roomName, me, allUsers, bannedUsers })
                }
              />
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
