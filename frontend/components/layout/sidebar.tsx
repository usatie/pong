import { FlexBasis, Gap } from "./tw-types";
export type SidebarProps = {
  children?: React.ReactNode;
  side?: "left" | "right";
  sideWidth?: FlexBasis;
  space?: Gap;
  noStretch?: boolean;
};

const firstChildBasis = {
  "basis-0": "[&>:first-child]:basis-0",
  "basis-1": "[&>:first-child]:basis-1",
  "basis-2": "[&>:first-child]:basis-2",
  "basis-3": "[&>:first-child]:basis-3",
  "basis-4": "[&>:first-child]:basis-4",
  "basis-5": "[&>:first-child]:basis-5",
  "basis-6": "[&>:first-child]:basis-6",
  "basis-7": "[&>:first-child]:basis-7",
  "basis-8": "[&>:first-child]:basis-8",
  "basis-9": "[&>:first-child]:basis-9",
  "basis-10": "[&>:first-child]:basis-10",
  "basis-11": "[&>:first-child]:basis-11",
  "basis-12": "[&>:first-child]:basis-12",
  "basis-14": "[&>:first-child]:basis-14",
  "basis-16": "[&>:first-child]:basis-16",
  "basis-20": "[&>:first-child]:basis-20",
  "basis-24": "[&>:first-child]:basis-24",
  "basis-28": "[&>:first-child]:basis-28",
  "basis-32": "[&>:first-child]:basis-32",
  "basis-36": "[&>:first-child]:basis-36",
  "basis-40": "[&>:first-child]:basis-40",
  "basis-44": "[&>:first-child]:basis-44",
  "basis-48": "[&>:first-child]:basis-48",
  "basis-52": "[&>:first-child]:basis-52",
  "basis-56": "[&>:first-child]:basis-56",
  "basis-60": "[&>:first-child]:basis-60",
  "basis-64": "[&>:first-child]:basis-64",
  "basis-72": "[&>:first-child]:basis-72",
  "basis-80": "[&>:first-child]:basis-80",
  "basis-96": "[&>:first-child]:basis-96",
  "basis-auto": "[&>:first-child]:basis-auto",
};

const lastChildBasis = {
  "basis-0": "[&>:last-child]:basis-0",
  "basis-1": "[&>:last-child]:basis-1",
  "basis-2": "[&>:last-child]:basis-2",
  "basis-3": "[&>:last-child]:basis-3",
  "basis-4": "[&>:last-child]:basis-4",
  "basis-5": "[&>:last-child]:basis-5",
  "basis-6": "[&>:last-child]:basis-6",
  "basis-7": "[&>:last-child]:basis-7",
  "basis-8": "[&>:last-child]:basis-8",
  "basis-9": "[&>:last-child]:basis-9",
  "basis-10": "[&>:last-child]:basis-10",
  "basis-11": "[&>:last-child]:basis-11",
  "basis-12": "[&>:last-child]:basis-12",
  "basis-14": "[&>:last-child]:basis-14",
  "basis-16": "[&>:last-child]:basis-16",
  "basis-20": "[&>:last-child]:basis-20",
  "basis-24": "[&>:last-child]:basis-24",
  "basis-28": "[&>:last-child]:basis-28",
  "basis-32": "[&>:last-child]:basis-32",
  "basis-36": "[&>:last-child]:basis-36",
  "basis-40": "[&>:last-child]:basis-40",
  "basis-44": "[&>:last-child]:basis-44",
  "basis-48": "[&>:last-child]:basis-48",
  "basis-52": "[&>:last-child]:basis-52",
  "basis-56": "[&>:last-child]:basis-56",
  "basis-60": "[&>:last-child]:basis-60",
  "basis-64": "[&>:last-child]:basis-64",
  "basis-72": "[&>:last-child]:basis-72",
  "basis-80": "[&>:last-child]:basis-80",
  "basis-96": "[&>:last-child]:basis-96",
  "basis-auto": "[&>:last-child]:basis-auto",
};

// 1. sideWidth="basis-80"
//    className={`[&_>_:first-child]:${sideWidth}`}
//    sometimes does NOT work
// 2. contentWidth="min-w-[50%]"
//    className={`[&>:last-child]:${contentWidth}`}
//    sometimes does NOT work
// --------------------------------------------------------------------------------------------
// 3. sideWidth = "[&_>_:first-child]:basis-80" does WORK
// 4. contentWidth = "[&_>_:first-child]:min-w-[50%]" does WORK
// 5. `[&_>_:first-child]:basis-80` does WORK
// 6. `[&>:last-child]:min-w-[50%]` does WORK
// Hmmmmm
// It is really difficult to combine
//   1. Arbitrary variants
//   2. Dynamic class name
//   3. Arbitrary values
// So, I removed `contentWidth` property
export function Sidebar({
  children,
  side = "left",
  sideWidth = "basis-80",
  space = "gap-0",
  noStretch = false,
}: SidebarProps) {
  const sidebarClasses =
    side === "left"
      ? `[&>:first-child]:grow ${firstChildBasis[sideWidth]}`
      : `[&>:last-child]:grow ${lastChildBasis[sideWidth]}`;
  // If dynamic arbitrary values can be used together with arbitrary variants,
  // [&>:last-child]:${contentWidth} can be used.
  const contentClasses =
    side === "left"
      ? `[&>:last-child]:grow-[999] [&>:last-child]:basis-0 [&>:last-child]:min-w-[50%]`
      : `[&>:first-child]:grow-[999] [&>:first-child]:basis-0 [&>:first-child]:min-w-[50%]`;
  const stretchClasses = noStretch ? "items-start" : "";
  return (
    <div
      className={`flex flex-wrap ${space} ${sidebarClasses} ${contentClasses} ${stretchClasses}`}
    >
      {children}
    </div>
  );
}
