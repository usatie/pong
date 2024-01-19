// components
import SignUpForm from "@/app/ui/auth/signup-form";

export default function SignUp() {
  return (
    <>
      <SignUpForm />
      <a href="http://localhost:4242/api/auth/signup/oauth2/42">
        sign up with 42
      </a>
    </>
  );
}
