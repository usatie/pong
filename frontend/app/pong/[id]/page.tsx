"use client";
import PongBoard from "./PongBoard";

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <PongBoard id={id} />;
}
