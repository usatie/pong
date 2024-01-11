import {
  AccessLevel,
  PublicUserEntity,
  UserOnRoomEntity,
} from "@/app/lib/dtos";
import { create } from "zustand";

type ModalType = "ban" | "setting" | "invite";

interface ModalData {
  roomId?: number;
  roomName?: string;
  me?: UserOnRoomEntity;
  allUsers?: PublicUserEntity[];
  members?: PublicUserEntity[];
  bannedUsers?: PublicUserEntity[];
  accessLevel?: AccessLevel;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
}));
