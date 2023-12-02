import { Gap } from "./tw-types";

export type SwitcherProps = {
  children?: React.ReactNode;
  threshold?:
    | "10rem"
    | "11rem"
    | "12rem"
    | "13rem"
    | "14rem"
    | "15rem"
    | "16rem"
    | "17rem"
    | "18rem"
    | "19rem"
    | "20rem"
    | "21rem"
    | "22rem"
    | "23rem"
    | "24rem"
    | "25rem"
    | "26rem"
    | "27rem"
    | "28rem"
    | "29rem"
    | "30rem"
    | "31rem"
    | "32rem"
    | "33rem"
    | "34rem"
    | "35rem"
    | "36rem"
    | "37rem"
    | "38rem"
    | "39rem"
    | "40rem"
    | "41rem"
    | "42rem"
    | "43rem"
    | "44rem"
    | "45rem"
    | "46rem"
    | "47rem"
    | "48rem"
    | "49rem"
    | "50rem"
    | "51rem"
    | "52rem"
    | "53rem"
    | "54rem"
    | "55rem"
    | "56rem"
    | "57rem"
    | "58rem"
    | "59rem"
    | "60rem"
    | "61rem"
    | "62rem"
    | "63rem"
    | "64rem";
  space?: Gap;
  limit?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
};

const thresholdClasses = {
  "10rem": "[&>*]:basis-[calc((10rem-100%)*999)]",
  "11rem": "[&>*]:basis-[calc((11rem-100%)*999)]",
  "12rem": "[&>*]:basis-[calc((12rem-100%)*999)]",
  "13rem": "[&>*]:basis-[calc((13rem-100%)*999)]",
  "14rem": "[&>*]:basis-[calc((14rem-100%)*999)]",
  "15rem": "[&>*]:basis-[calc((15rem-100%)*999)]",
  "16rem": "[&>*]:basis-[calc((16rem-100%)*999)]",
  "17rem": "[&>*]:basis-[calc((17rem-100%)*999)]",
  "18rem": "[&>*]:basis-[calc((18rem-100%)*999)]",
  "19rem": "[&>*]:basis-[calc((19rem-100%)*999)]",
  "20rem": "[&>*]:basis-[calc((20rem-100%)*999)]",
  "21rem": "[&>*]:basis-[calc((21rem-100%)*999)]",
  "22rem": "[&>*]:basis-[calc((22rem-100%)*999)]",
  "23rem": "[&>*]:basis-[calc((23rem-100%)*999)]",
  "24rem": "[&>*]:basis-[calc((24rem-100%)*999)]",
  "25rem": "[&>*]:basis-[calc((25rem-100%)*999)]",
  "26rem": "[&>*]:basis-[calc((26rem-100%)*999)]",
  "27rem": "[&>*]:basis-[calc((27rem-100%)*999)]",
  "28rem": "[&>*]:basis-[calc((28rem-100%)*999)]",
  "29rem": "[&>*]:basis-[calc((29rem-100%)*999)]",
  "30rem": "[&>*]:basis-[calc((30rem-100%)*999)]",
  "31rem": "[&>*]:basis-[calc((31rem-100%)*999)]",
  "32rem": "[&>*]:basis-[calc((32rem-100%)*999)]",
  "33rem": "[&>*]:basis-[calc((33rem-100%)*999)]",
  "34rem": "[&>*]:basis-[calc((34rem-100%)*999)]",
  "35rem": "[&>*]:basis-[calc((35rem-100%)*999)]",
  "36rem": "[&>*]:basis-[calc((36rem-100%)*999)]",
  "37rem": "[&>*]:basis-[calc((37rem-100%)*999)]",
  "38rem": "[&>*]:basis-[calc((38rem-100%)*999)]",
  "39rem": "[&>*]:basis-[calc((39rem-100%)*999)]",
  "40rem": "[&>*]:basis-[calc((40rem-100%)*999)]",
  "41rem": "[&>*]:basis-[calc((41rem-100%)*999)]",
  "42rem": "[&>*]:basis-[calc((42rem-100%)*999)]",
  "43rem": "[&>*]:basis-[calc((43rem-100%)*999)]",
  "44rem": "[&>*]:basis-[calc((44rem-100%)*999)]",
  "45rem": "[&>*]:basis-[calc((45rem-100%)*999)]",
  "46rem": "[&>*]:basis-[calc((46rem-100%)*999)]",
  "47rem": "[&>*]:basis-[calc((47rem-100%)*999)]",
  "48rem": "[&>*]:basis-[calc((48rem-100%)*999)]",
  "49rem": "[&>*]:basis-[calc((49rem-100%)*999)]",
  "50rem": "[&>*]:basis-[calc((50rem-100%)*999)]",
  "51rem": "[&>*]:basis-[calc((51rem-100%)*999)]",
  "52rem": "[&>*]:basis-[calc((52rem-100%)*999)]",
  "53rem": "[&>*]:basis-[calc((53rem-100%)*999)]",
  "54rem": "[&>*]:basis-[calc((54rem-100%)*999)]",
  "55rem": "[&>*]:basis-[calc((55rem-100%)*999)]",
  "56rem": "[&>*]:basis-[calc((56rem-100%)*999)]",
  "57rem": "[&>*]:basis-[calc((57rem-100%)*999)]",
  "58rem": "[&>*]:basis-[calc((58rem-100%)*999)]",
  "59rem": "[&>*]:basis-[calc((59rem-100%)*999)]",
  "60rem": "[&>*]:basis-[calc((60rem-100%)*999)]",
  "61rem": "[&>*]:basis-[calc((61rem-100%)*999)]",
  "62rem": "[&>*]:basis-[calc((62rem-100%)*999)]",
  "63rem": "[&>*]:basis-[calc((63rem-100%)*999)]",
  "64rem": "[&>*]:basis-[calc((64rem-100%)*999)]",
};

const limitClasses = {
  1: "[&>:nth-last-child(n+2)~*]:basis-full",
  2: "[&>:nth-last-child(n+3)~*]:basis-full",
  3: "[&>:nth-last-child(n+4)~*]:basis-full",
  4: "[&>:nth-last-child(n+5)~*]:basis-full",
  5: "[&>:nth-last-child(n+6)~*]:basis-full",
  6: "[&>:nth-last-child(n+7)~*]:basis-full",
  7: "[&>:nth-last-child(n+8)~*]:basis-full",
  8: "[&>:nth-last-child(n+9)~*]:basis-full",
  9: "[&>:nth-last-child(n+10)~*]:basis-full",
  10: "[&>:nth-last-child(n+11)~*]:basis-full",
};

export function Switcher({
  children,
  threshold = "30rem",
  space = "gap-1",
  limit = 4,
}: SwitcherProps) {
  const childClasses = `[&>*]:grow`;
  const thresholdClass = thresholdClasses[threshold];
  const limitClass = limitClasses[limit];
  return (
    <div
      className={`flex flex-wrap ${space} ${childClasses} ${thresholdClass} ${limitClass}`}
    >
      {children}
    </div>
  );
}
