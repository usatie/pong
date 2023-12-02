export type CenterProps = {
  children?: React.ReactNode;
  intrinsic?: boolean;
};
export function Center({ children, intrinsic = false }: CenterProps) {
  const intrinsicStyle = intrinsic ? "flex flex-col items-center" : "";
  return (
    <div className={`max-w-prose mx-auto box-content ${intrinsicStyle}`}>
      {children}
    </div>
  );
}
