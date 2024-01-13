import { redirect } from "next/navigation";

const signupWithGoogle = () => {
  const response_type = "code";
  const client_id = process.env.OAUTH_GOOGLE_CLIENT_ID;
  const client_secret = process.env.OAUTH_GOOGLE_CLIENT_SECRET;
  const redirect_uri = "http://localhost:4242/signup/oauth/redirect";
  const scope = "https://www.googleapis.com/auth/cloud-platform";

  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    `&client_id=${client_id}` +
    `&redirect_uri=${redirect_uri}` +
    `&response_type=code` +
    `&scope=${scope}`;
  redirect(url);
};

export default signupWithGoogle;
