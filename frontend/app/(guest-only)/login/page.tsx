import LoginForm from "@/app/ui/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <a href="http://localhost:4242/api/auth/login/oauth2/42">login with 42</a>
    </>
  );
}
