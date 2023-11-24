import DirectMessageSidebar from "@/app/direct-message/dm-sidebar";

const DMlayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <div
        className="hidden md:flex h-full w-[100px]
      z-20 flex-col fixed inset-y-100"
      >
        <DirectMessageSidebar />
      </div>
      <main className="md:pl-[100px] h-full">{children}</main>
    </div>
  );
};

export default DMlayout;
