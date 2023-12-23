import TwoFactorAuthVerifyForm from "@/app/ui/auth/verify-form";

export default function TwoFactorAuthenticationPage() {
  return (
    <>
      <div className="text-2xl">Two-step authentication</div>
      <TwoFactorAuthVerifyForm />
    </>
  );
}
