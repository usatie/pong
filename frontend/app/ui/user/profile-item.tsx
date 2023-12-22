export default async function ProfileItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xl font-bold">{title}</div>
      {children}
    </div>
  );
}
