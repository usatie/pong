import LoginForm from "@/app/ui/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/login/oauth2/42`}>
        login with 42
      </a>
    </>
  );
}
