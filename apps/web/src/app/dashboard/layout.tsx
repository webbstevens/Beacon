import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <h1 className="dashboard-header-logo">Beacon</h1>
          <nav className="flex items-center gap-1 ml-8">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              Generator
            </Link>
            <Link
              href="/dashboard/radar"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              Radar
            </Link>
          </nav>
          <div className="dashboard-header-right">
            <span className="dashboard-header-email">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="dashboard-content">{children}</main>
    </div>
  );
}
