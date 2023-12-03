export type BoxProps = {
  children?: React.ReactNode;
  padding?: string;
  borderWidth?: string;
  borderColor?: string;
};
export function Box({
  children,
  padding = "p-6",
  borderWidth = "border-4",
  borderColor = "border-white",
}: BoxProps) {
  return (
    <div className={`${padding} ${borderColor} ${borderWidth}`}>{children}</div>
  );
}
