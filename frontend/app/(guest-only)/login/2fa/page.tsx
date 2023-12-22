import TwoFactorAuthVerifyForm from "@/app/settings/2fa/verify-form";

export default function TwoFactorAuthenticationPage() {
  return (
    <>
      <div className="text-2xl">Two-step authentication</div>
      <TwoFactorAuthVerifyForm />
    </>
  );
}
