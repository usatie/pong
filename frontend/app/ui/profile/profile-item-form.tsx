import { Stack } from "@/app/ui/layout/stack";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

export type ProfileItemProps = {
  type: string;
  title: string;
  value?: string;
};

export function ProfileItem({ type, title, value }: ProfileItemProps) {
  return (
    <Stack spacing={1} className="w-96">
      <Label htmlFor={title} className="text-xs text-muted-foreground">
        {title}
      </Label>
      <Input type={type} id={title} name={title} defaultValue={value} />
    </Stack>
  );
}
