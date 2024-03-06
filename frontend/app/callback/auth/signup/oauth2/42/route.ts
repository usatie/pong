import { redirect } from "next/navigation";

const isValidUrl = (url: string) => {
  return URL.canParse(url);
};

export async function GET(request: Request) {
  if (!isValidUrl(request.url)) {
    redirect("/signup");
  }
  const { searchParams } = new URL(request.url);
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
    console.error("Failed to authenticate", data);
    const params = new URLSearchParams({
      status: data.statusCode,
      message: data.message,
    });
    const query = "?" + params.toString();
    redirect("/signup" + query);
  } else {
    redirect("/login");
  }
}
