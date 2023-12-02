import { Space } from "./tw-types";

export type StackProps = {
  children?: React.ReactNode;
  space?: Space;
};

export function Stack({ children, space = "space-y-4" }: StackProps) {
  // Arbitrary Variants with dynamic value doesn't work with Tailwind?
  // https://tailwindcss.com/docs/just-in-time-mode#arbitrary-variants
  // <div className={`flex flex-col ${space} [&>*]:${gap} [&>*]:rounded [&_*]:border-gray-500`}>
  return <div className={`${space} flex flex-col justify-end`}>{children}</div>;
}
