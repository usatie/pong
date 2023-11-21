"use client";

// layout
import { Stack } from "@/app/ui/layout/stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ChangePasswordCard() {
  return (
    <>
      <Card className="w-80">
        <CardHeader>Change Password</CardHeader>
        <CardContent>
          <Stack spacing={4}>
            <Input
              type="password"
              id="current-password"
              placeholder="Enter your current password"
            />
            <Input
              type="password"
              id="new-password"
              placeholder="New Password"
            />
            <Input
              type="password"
              id="confirm-password"
              placeholder="Confirm Password"
            />
            <Button>Submit</Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
