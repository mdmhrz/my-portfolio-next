'use client';

import { authClient } from "@/lib/auth-client";

export function DashboardGreeting() {
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.trim().split(" ")[0] ?? "";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {greeting}
        {firstName ? `, ${firstName}` : ""} 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Here&rsquo;s a snapshot of your content, traffic, and inbound interest.
      </p>
    </div>
  );
}
