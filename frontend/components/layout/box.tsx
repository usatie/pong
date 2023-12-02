export type BoxProps = {
  children?: React.ReactNode;
  padding?: string;
  borderWidth?: string;
};
export function Box({
  children,
  padding = "p-6",
  borderWidth = "border-4",
}: BoxProps) {
  return (
    <div className={`${padding} border-white ${borderWidth}`}>{children}</div>
  );
}
