import { redirect } from "next/navigation";

const signupWithGoogle = () => {
  const response_type = "code";
  const client_id = process.env.OAUTH_42_CLIENT_ID;
  const redirect_uri = process.env.OAUTH_REDIRECT_URI;
  const scope = "public";
  const state = "42";

  const url =
    "https://api.intra.42.fr/oauth/authorize?" +
    `&client_id=${client_id}` +
    `&redirect_uri=${redirect_uri}` +
    `&response_type=${response_type}` +
    `&scope=${scope}` +
    `&state=${state}`;
  redirect(url);
};

export default signupWithGoogle;
