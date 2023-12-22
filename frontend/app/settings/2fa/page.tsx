import { generate2FASecret } from "@/app/lib/actions";
import { getCurrentUser } from "@/app/lib/session";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toDataURL } from "qrcode";
import TwoFactorAuthVerifyForm from "./verify-form";

export default async function TwoFactorAuthPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.twoFactorEnabled) {
    // TODO: Disable 2FA button
    return (
      <div className="flex flex-col items-center">
        <p className="my-4">&#9989; 2FA is already enabled.</p>
      </div>
    );
  }
  const { otpAuthUrl } = await generate2FASecret();
  const qrcodeDataURL = await toDataURL(otpAuthUrl);
  return (
    <div className="flex flex-col items-center">
      <p className="my-4">
        You will need a&nbsp;
        <Link
          href="https://support.google.com/accounts/answer/1066447"
          className="text-primary"
        >
          Google Authenticator
        </Link>{" "}
        to complete this process
      </p>
      <div className="font-bold text-sm">Scan QR Code</div>
      <img src={qrcodeDataURL} className="w-48 h-48" />
      <Separator className="my-4" />
      <TwoFactorAuthVerifyForm />
    </div>
  );
}
