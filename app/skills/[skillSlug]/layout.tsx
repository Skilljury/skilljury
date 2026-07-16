import { connection } from "next/server";
import type { ReactNode } from "react";

type SkillRouteLayoutProps = {
  children: ReactNode;
};

export default async function SkillRouteLayout({
  children,
}: SkillRouteLayoutProps) {
  await connection();

  return children;
}
