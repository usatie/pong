import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <div className="text-muted-foreground">Hello</div>
      <div className="flex gap-8">
        <Button variant={"secondary"}>Learn More</Button>
        <Button>Enroll</Button>
      </div>
    </>
  );
}
