import { redirect } from "next/navigation";
import { setAccessToken } from "@/app/lib/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const res = await fetch(
    `${process.env.API_URL}/auth/login/oauth2/42/authenticate?${searchParams}`,
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
    redirect("/login");
  }
  setAccessToken(data.accessToken);
  redirect("/");
}
