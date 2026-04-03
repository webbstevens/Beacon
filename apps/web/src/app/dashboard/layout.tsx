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
