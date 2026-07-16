import { connection } from "next/server";
import type { ReactNode } from "react";

type AgentRouteLayoutProps = {
  children: ReactNode;
};

export default async function AgentRouteLayout({
  children,
}: AgentRouteLayoutProps) {
  await connection();

  return children;
}
