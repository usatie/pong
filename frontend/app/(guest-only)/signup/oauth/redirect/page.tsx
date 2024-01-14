"use client";

import { useSearchParams } from "next/navigation";

const redirect_page = async () => {
  const params = useSearchParams();
  if (params.has("error")) {
    const reason = params.get("error");
    return <>Error です {reason}</>;
  } else {
    // TODO state の確認(SHOULD)

    // TODO 認可コードの取得
    const code = params.get("code");
    console.log(code);

    const client_secret = process.env.OAUTH_GOOGLE_CLIENT_SECRET;
    const client_id = process.env.OAUTH_GOOGLE_CLIENT_ID;

    const formData =
      `code=${code}` +
      `&client_id=${client_id}` +
      `&client_secret=${client_secret}` +
      `&redirect_uri=http://localhost:4242/signup/oauth/redirect` +
      `&grant_type=authorization_code`;

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const tokRes: Response = await fetch(
      //   "http://localhost:80",
      "https://accounts.google.com/o/oauth2/token",
      {
        method: "POST",
        headers: headers,
        body: formData,
      }
    );

    // // TODO accesstoken とる
    if (tokRes.status >= 200 && tokRes.status < 300) {
	  const body = await tokRes.json();
	  console.log(body);
	  const access_token = body.access_token;
      console.log('access token is ', access_token);
    } else console.log(tokRes.status);
    // TODO 保存する
    // TODO resource とる
    return <>{code}</>;
  }
};

export default redirect_page;
