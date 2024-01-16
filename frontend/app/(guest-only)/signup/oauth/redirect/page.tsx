import { createUserWithOauth } from "@/app/lib/actions";

const Callback = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  if (searchParams === undefined) {
    return <h1>hoge</h1>;
  }
  console.log(searchParams);
  if (searchParams["code"] === undefined) {
    return <h1>hoge</h1>;
  }
  await createUserWithOauth(searchParams["code"], "42");
  return <h1>hoge</h1>;
};

export default Callback;
