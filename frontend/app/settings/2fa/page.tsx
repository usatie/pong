import {
  disableTwoFactorAuthentication,
  generate2FASecret,
} from "@/app/lib/actions";
import { getAccessTokenPayload } from "@/app/lib/session";
import TwoFactorAuthVerifyForm from "@/app/ui/auth/verify-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toDataURL } from "qrcode";

export default async function TwoFactorAuthPage() {
  const payload = await getAccessTokenPayload({ ignoreExpiration: true });
  if (payload?.isTwoFactorEnabled) {
    return (
      <form action={disableTwoFactorAuthentication}>
        <Button type="submit">Disable 2FA</Button>
      </form>
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
