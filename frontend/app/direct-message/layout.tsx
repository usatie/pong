import DirectMessageSidebar from "@/app/ui/direct-message/dm-sidebar";

const DMlayout = async ({ children }: { children: React.ReactNode }) => {
  // flex-grow: to fill the remaining space
  return (
    <div className="flex-grow flex flex-row gap-8">
      <aside>
        <DirectMessageSidebar />
      </aside>
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default DMlayout;
