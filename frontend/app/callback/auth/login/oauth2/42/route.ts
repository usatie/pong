import { setAccessToken } from "@/app/lib/session";
import { redirect } from "next/navigation";

const isValidUrl = (url: string) => {
  return URL.canParse(url);
};

export async function GET(request: Request) {
  if (!isValidUrl(request.url)) {
    redirect("/login");
  }
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
    console.error("Failed to authenticate", data);
    const params = new URLSearchParams({
      status: data.statusCode,
      message: data.message,
    });
    const query = "?" + params.toString();
    redirect("/login" + query);
  } else {
    setAccessToken(data.accessToken);
    redirect("/");
  }
}
