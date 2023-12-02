import { AlignItems, Gap, JustifyContent } from "./tw-types";

export type ClusterProps = {
  children?: React.ReactNode;
  justify?: JustifyContent;
  align?: AlignItems;
  space?: Gap;
};

export function Cluster({
  children,
  justify = "justify-start",
  align = "items-start",
  space = "gap-4",
}: ClusterProps) {
  return (
    <div className={`flex flex-wrap ${justify} ${align} ${space}`}>
      {children}
    </div>
  );
}
