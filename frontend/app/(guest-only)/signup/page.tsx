// components
import SignUpForm from "@/app/ui/auth/signup-form";

export default function SignUp() {
  return (
    <>
      <SignUpForm />
      <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/signup/oauth2/42`}>
        sign up with 42
      </a>
    </>
  );
}
