import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.error("Route handler called");
  console.error(
    "fetching",
    `${process.env.API_URL}/auth/signup/oauth2/42/authenticate?${searchParams}`,
  );
  const res = await fetch(
    `${process.env.API_URL}/auth/signup/oauth2/42/authenticate?${searchParams}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await res.json();
  if (!res.ok) {
    console.error("Failed to authenticate", res);
    console.error("Failed to authenticate", data);
    redirect("/signup");
  }
  redirect("/login");
}
