import Nav from "../components/Nav";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 p-24">
      <Nav />
      <div className="text-muted-foreground">Hello</div>
      <div className="flex gap-8">
        <Button variant={"secondary"}>Learn More</Button>
        <Button>Enroll</Button>
      </div>
    </main>
  );
}
