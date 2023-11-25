import DirectMessageSidebar from "@/app/direct-message/dm-sidebar";

const DMlayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full flex-row">
      <div
        className="hidden md:flex h-full w-[140px]
      z-20 flex-col inset-y-100"
      >
        <DirectMessageSidebar />
      </div>
      <main className="md:pl-[140px] h-full">{children}</main>
    </div>
  );
};

export default DMlayout;
